from fastapi import APIRouter

from app.api.v1.endpoints import auth, generate, users, projects, stripe as stripe_router

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(generate.router, prefix="/generate", tags=["generate"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(stripe_router.router, prefix="/stripe", tags=["stripe"])
