import os
from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context

from app.db.base import Base
from app.models.user import User  # noqa: F401
from app.models.project import Project  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url():
    """Build database URL from individual PG* env vars or fall back to DATABASE_URL."""
    print(f"PGHOST={os.environ.get('PGHOST', 'NOT SET')}")
    print(f"PGPORT={os.environ.get('PGPORT', 'NOT SET')}")
    print(f"PGDATABASE={os.environ.get('PGDATABASE', 'NOT SET')}")
    print(f"PGUSER={os.environ.get('PGUSER', 'NOT SET')}")
    print(f"DATABASE_URL={os.environ.get('DATABASE_URL', 'NOT SET')}")
    # Try individual PostgreSQL variables first (Railway provides these)
    host = os.environ.get("PGHOST")
    port = os.environ.get("PGPORT", "5432")
    database = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")

    if all([host, database, user, password]):
        return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"

    # Fall back to DATABASE_URL
    url = os.environ.get("DATABASE_URL", "")
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    url = get_url()
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
