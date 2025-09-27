# NutriAI - AI Meal Plan Builder

A complete, production-ready SaaS platform for AI-powered meal planning. Generate personalized 7-day meal plans with detailed nutritional information, recipes, and grocery lists.

## 🚀 Features

- **AI-Powered Meal Planning**: Generate personalized meal plans in 30 seconds
- **Comprehensive Nutrition**: Detailed macros, calories, and nutritional information
- **Multiple Diet Support**: Omnivore, Vegan, Vegetarian, Keto, Mediterranean, Paleo
- **Allergy & Preference Management**: Avoid allergens and accommodate dislikes
- **PDF Export**: Beautiful, printable meal plans with grocery lists
- **Email Delivery**: Automatic PDF delivery via email
- **Subscription Management**: Free, Pro Monthly, and Pro Annual plans
- **Secure Authentication**: NextAuth with email magic links and Google OAuth
- **Modern Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Prisma, Supabase

## 🏗️ Architecture

### Monorepo Structure
```
nutriai/
├── apps/
│   ├── web/                 # Next.js web application
│   └── worker/              # Python FastAPI worker service
├── packages/
│   └── shared/              # Shared types and utilities
└── .github/workflows/       # CI/CD pipeline
```

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes, Python FastAPI worker
- **Database**: Supabase Postgres with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **AI**: OpenAI GPT-4
- **Storage**: Supabase Storage
- **PDF Generation**: PDFKit

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+ and Poetry
- Supabase account
- Stripe account
- OpenAI API key
- Resend account

### 1. Clone and Install
```bash
git clone <repository-url>
cd nutriai
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment files
cp env.example .env
cp apps/web/env.example apps/web/.env.local
cp apps/worker/env.example apps/worker/.env
```

### 3. Database Setup
```bash
# Set up Supabase database
pnpm -w run db:push

# Seed with test data
pnpm -w run db:seed
```

### 4. Start Development Servers
```bash
# Start both web and worker services
pnpm -w run dev
```

This will start:
- Web app on http://localhost:4321
- Worker service on http://localhost:8420

### 5. Test the Application
1. Visit http://localhost:4321
2. Sign up with test@nutriai.com (from seed data)
3. Generate your first meal plan!

## 📋 Environment Variables

### Root (.env)
```bash
# Shared configuration
NEXT_PUBLIC_APP_NAME=NutriAI
```

### Web App (apps/web/.env.local)
```bash
# App Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:4321
PORT=4321

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nutriai
DIRECT_URL=postgresql://postgres:password@localhost:5432/nutriai

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_PRICE_PRO_MONTHLY_EUR=price_your-monthly-price-id
STRIPE_PRICE_PRO_ANNUAL_EUR=price_your-annual-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
RESEND_API_KEY=re_your-resend-api-key

# Worker Service
WORKER_URL=http://localhost:8420

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Worker Service (apps/worker/.env)
```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:4321

# Server
PORT=8420
```

## 🧪 Testing

### Unit Tests
```bash
# Web app tests
cd apps/web
pnpm test

# Worker service tests
cd apps/worker
poetry run pytest tests/ -v
```

### E2E Tests
```bash
# Install Playwright browsers
cd apps/web
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e
```

## 🚀 Deployment

### Web App (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Worker Service (Render/Fly.io)
1. **Render**: Connect GitHub repo and deploy using `render.yaml`
2. **Fly.io**: Use `fly deploy` with the included Dockerfile

### Database (Supabase)
1. Create a new Supabase project
2. Run migrations: `pnpm -w run db:push`
3. Set up Row Level Security policies
4. Configure storage buckets for PDFs

## 📊 API Endpoints

### Web App API Routes
- `POST /api/mealplan` - Generate meal plan
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/user/data` - Get user data

### Worker Service Endpoints
- `POST /generate` - Generate meal plan
- `GET /health` - Health check

## 🔧 Development Commands

```bash
# Root level
pnpm dev              # Start all services
pnpm build           # Build all apps
pnpm test            # Run all tests
pnpm lint            # Lint all code

# Web app
cd apps/web
pnpm dev             # Start dev server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm test            # Run unit tests
pnpm test:e2e        # Run E2E tests
pnpm db:push         # Push schema changes
pnpm db:seed         # Seed database

# Worker service
cd apps/worker
poetry run uvicorn worker.main:app --reload --port 8420
poetry run pytest tests/ -v
```

## 🏗️ Project Structure

### Web App (`apps/web/`)
```
src/
├── app/                    # Next.js app router
│   ├── (marketing)/       # Marketing pages
│   ├── (dashboard)/       # Authenticated dashboard
│   └── api/              # API routes
├── components/            # React components
│   ├── marketing/        # Landing page components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
└── styles/               # Global styles
```

### Worker Service (`apps/worker/`)
```
worker/
├── main.py               # FastAPI app
├── routers/              # API routes
├── services/             # Business logic
├── schemas.py            # Pydantic models
└── config.py             # Configuration
```

## 🔒 Security Features

- **Authentication**: NextAuth.js with secure session management
- **Authorization**: Role-based access control
- **Data Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth.js CSRF tokens
- **Rate Limiting**: Built into API routes
- **Environment Variables**: Secure secret management

## 📈 Monitoring & Analytics

- **Health Checks**: Built-in health endpoints
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Built-in Next.js analytics
- **Database Monitoring**: Supabase built-in monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Email**: support@nutriai.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Recipe detail pages
- [ ] Meal plan sharing
- [ ] Nutrition tracking integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

---

Built with ❤️ by the NutriAI team
