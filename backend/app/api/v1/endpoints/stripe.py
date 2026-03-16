from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import stripe

from app.api.deps import CurrentUser, DBSession
from app.core.config import settings
from app.models.user import User

router = APIRouter()


def get_stripe_client():
    """Initialize stripe with API key from settings."""
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def get_price_to_plan():
    """Map price IDs to plan names."""
    mapping = {}
    if settings.STRIPE_PRO_PRICE_ID:
        mapping[settings.STRIPE_PRO_PRICE_ID] = "pro"
    if settings.STRIPE_TEAM_PRICE_ID:
        mapping[settings.STRIPE_TEAM_PRICE_ID] = "team"
    return mapping


class CheckoutRequest(BaseModel):
    plan: str


@router.post("/checkout/")
def create_checkout(
    request: CheckoutRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    get_stripe_client()

    price_id = settings.STRIPE_PRO_PRICE_ID if request.plan == "pro" else settings.STRIPE_TEAM_PRICE_ID
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan or price not configured")

    try:
        # Get or create stripe customer
        if current_user.stripe_customer_id:
            customer_id = current_user.stripe_customer_id
        else:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            current_user.stripe_customer_id = customer.id
            db.commit()
            customer_id = customer.id

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/settings?tab=billing&success=true",
            cancel_url=f"{settings.FRONTEND_URL}/settings?tab=billing",
        )
        return {"checkout_url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/portal/")
def create_portal(
    current_user: CurrentUser,
    db: DBSession,
):
    get_stripe_client()

    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")

    try:
        session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings?tab=billing",
        )
        return {"portal_url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook/")
async def stripe_webhook(request: Request, db: DBSession):
    get_stripe_client()

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    price_map = get_price_to_plan()

    if event["type"] in ["customer.subscription.created", "customer.subscription.updated"]:
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]
        price_id = subscription["items"]["data"][0]["price"]["id"]
        plan = price_map.get(price_id, "free")

        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.plan = plan
            db.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]

        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.plan = "free"
            db.commit()

    return {"status": "ok"}
