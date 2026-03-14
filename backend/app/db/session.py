import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def get_database_url() -> str:
    """Build database URL from individual PG* env vars or fall back to DATABASE_URL."""
    # Try individual PostgreSQL variables first (Railway provides these)
    host = os.environ.get("PGHOST")
    port = os.environ.get("PGPORT", "5432")
    database = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")

    if all([host, database, user, password]):
        return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"

    # Fall back to DATABASE_URL
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/corefront")
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


engine = create_engine(get_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
