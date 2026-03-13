# Corefront

AI-powered application builder - build full-stack apps from simple prompts.

**Domain:** [corefront.ai](https://corefront.ai)

## Overview

Corefront is an AI-powered platform that transforms natural language prompts into production-ready full-stack applications. Built with Claude AI for superior code generation.

## Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL (Supabase)
- Claude AI (Anthropic)
- Celery + Redis

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

**Infrastructure:**
- Docker & Docker Compose
- Railway (production deployment)

## Features (Roadmap)

### MVP (Phase 1)
- [x] Project setup
- [ ] AI code generation (React)
- [ ] Live preview environment
- [ ] Vercel deployment
- [ ] User authentication

### V1.1 (Phase 2)
- [ ] Multi-framework support (Vue, Svelte)
- [ ] Premium templates
- [ ] Git integration
- [ ] Team collaboration

### V2.0 (Phase 3)
- [ ] API integration marketplace
- [ ] Auto-testing generation
- [ ] Performance monitoring
- [ ] Enterprise features

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Claude API key (Anthropic)

### Local Development

1. Clone the repository
```bash
git clone https://github.com/drphyl/corefront.git
cd corefront
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start services
```bash
docker-compose up
```

4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure
```
corefront/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config, security
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   └── main.py      # App entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # Next.js 14 app router
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Architecture

Corefront is built with scalability in mind from day one:

- **Modular Backend:** Plugin-based code generators for different frameworks
- **Feature Flags:** Enable/disable features without code changes
- **Multi-Tenant:** Designed for SaaS from the ground up
- **Extensible:** Easy to add new frameworks, templates, and integrations

## Differentiation (vs Lovable)

- ✅ Claude AI (better code quality than GPT)
- ✅ Multi-framework support (React, Vue, Svelte)
- ✅ Built by AI governance experts
- ✅ Enterprise-ready from day one
- ✅ Real-time collaboration
- ✅ Auto-generated testing

## License

MIT

## Contact

Built by Dr. Phyl - AI Governance & Development Expert
- Website: [CorefrontAI.com](https://corefrontai.com)
- Product: [corefront.ai](https://corefront.ai)
