# Railway Deployment Guide

Deploy Corefront to Railway with PostgreSQL and Redis.

## Prerequisites

1. [Railway CLI](https://docs.railway.app/develop/cli) installed
2. Railway account at [railway.app](https://railway.app)

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Create a New Project

```bash
railway init
```

### 3. Add PostgreSQL Database

```bash
railway add --plugin postgresql
```

### 4. Add Redis

```bash
railway add --plugin redis
```

### 5. Deploy Backend Service

```bash
cd backend
railway up
```

Set these environment variables in Railway dashboard:
- `DATABASE_URL` - Auto-set by PostgreSQL plugin
- `REDIS_URL` - Auto-set by Redis plugin
- `SECRET_KEY` - Generate a secure random string
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `CORS_ORIGINS` - Your frontend URL (e.g., https://corefront-frontend.up.railway.app)

### 6. Deploy Frontend Service

```bash
cd frontend
railway up
```

Set these environment variables:
- `NEXT_PUBLIC_API_URL` - Your backend URL (e.g., https://corefront-backend.up.railway.app)

### 7. Generate Domain

In Railway dashboard, go to each service and generate a domain under Settings > Domains.

## Environment Variables Reference

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| REDIS_URL | Redis connection string | redis://... |
| SECRET_KEY | JWT signing key | random-32-char-string |
| ANTHROPIC_API_KEY | Claude API key | sk-ant-... |
| CORS_ORIGINS | Allowed origins (comma-separated) | https://corefront.ai |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | https://api.corefront.ai |

## Custom Domain Setup

1. Go to Railway dashboard > Service > Settings > Domains
2. Add custom domain (e.g., api.corefront.ai, app.corefront.ai)
3. Update DNS records as instructed
4. Update CORS_ORIGINS and NEXT_PUBLIC_API_URL accordingly

## Monorepo Structure

```
corefront/
├── backend/
│   ├── railway.toml    # Backend service config
│   └── Dockerfile
├── frontend/
│   ├── railway.toml    # Frontend service config
│   └── Dockerfile
└── RAILWAY_DEPLOY.md
```

Each service is deployed separately in Railway with its own `railway.toml` configuration.
