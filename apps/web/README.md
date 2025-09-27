# NutriAI Web App

The main Next.js web application for NutriAI - AI Meal Plan Builder.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account
- Stripe account
- OpenAI API key
- Resend account

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Fill in your actual values in .env.local

# Set up database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

The app will be available at http://localhost:4321

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📋 Environment Variables

Required environment variables:

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

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (marketing)/       # Marketing pages
│   │   ├── page.tsx       # Landing page
│   │   ├── pricing/       # Pricing page
│   │   ├── faq/           # FAQ page
│   │   ├── terms/         # Terms of service
│   │   ├── privacy/       # Privacy policy
│   │   └── signin/        # Sign in page
│   ├── (dashboard)/       # Authenticated dashboard
│   │   ├── layout.tsx     # Dashboard layout
│   │   └── page.tsx       # Dashboard page
│   ├── api/               # API routes
│   │   ├── mealplan/      # Meal plan generation
│   │   ├── stripe/        # Stripe webhooks
│   │   └── user/          # User data
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── marketing/         # Landing page components
│   │   ├── Hero.tsx       # Hero section
│   │   ├── FeatureGrid.tsx # Feature grid
│   │   ├── SocialProof.tsx # Testimonials
│   │   ├── PricingTables.tsx # Pricing plans
│   │   ├── FAQ.tsx        # FAQ section
│   │   └── CTASection.tsx # Call-to-action
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   ├── input.tsx      # Input component
│   │   ├── label.tsx      # Label component
│   │   └── skeleton.tsx   # Loading skeleton
│   └── layout/            # Layout components
│       ├── Header.tsx     # Site header
│       └── Footer.tsx     # Site footer
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── supabase.ts        # Supabase client
│   ├── stripe.ts          # Stripe configuration
│   ├── pricing.ts         # Pricing logic
│   ├── pdf.ts             # PDF generation
│   ├── email.ts           # Email service
│   ├── zod-schemas.ts     # Validation schemas
│   └── utils.ts           # Utility functions
└── styles/                # Global styles
    └── globals.css        # Global CSS
```

## 🔧 Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript compiler
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm db:studio        # Open Prisma Studio
```

## 🎨 Styling

The app uses:
- **TailwindCSS** for utility-first styling
- **shadcn/ui** for pre-built components
- **Inter font** for typography
- **Custom CSS variables** for theming

### Color Scheme
- Primary: `#10B981` (Emerald 500)
- Background: White with gray-50 accents
- Text: Slate/Stone grays
- Borders: Light gray dividers

## 🔐 Authentication

The app uses NextAuth.js with:
- **Email magic links** (primary)
- **Google OAuth** (optional)
- **Database sessions** with Prisma
- **Automatic subscription creation** for new users

## 💳 Payments

Stripe integration includes:
- **Free plan** (1 meal plan/month)
- **Pro Monthly** (€9.99/month)
- **Pro Annual** (€59/year, 51% off)
- **Webhook handling** for subscription updates
- **Checkout sessions** for upgrades

## 📧 Email

Resend integration for:
- **Meal plan delivery** with PDF attachments
- **Welcome emails** for new users
- **Subscription confirmations**
- **Password reset** (if implemented)

## 🗄️ Database

Prisma with Supabase Postgres:
- **User management** with NextAuth
- **Subscription tracking** with Stripe integration
- **Meal preferences** storage
- **Meal plan history** with JSON data
- **PDF document** management

## 📄 PDF Generation

PDFKit for meal plan PDFs:
- **Branded headers** with NutriAI logo
- **Day-by-day meal cards** with nutrition info
- **Ingredient lists** with quantities
- **Cooking instructions** step-by-step
- **Grocery lists** organized by category
- **Weekly totals** summary

## 🧪 Testing Strategy

- **Unit tests** for utilities and business logic
- **Integration tests** for API routes
- **E2E tests** for critical user flows
- **Type checking** with TypeScript
- **Linting** with ESLint

## 🚀 Performance

- **Next.js 14** with App Router
- **Server-side rendering** for SEO
- **Image optimization** with Next.js Image
- **Code splitting** automatic
- **Caching** with Next.js built-in caching

## 🔒 Security

- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma
- **XSS protection** with React
- **CSRF protection** with NextAuth
- **Environment variable** security
- **Rate limiting** on API routes

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interactions
- **Accessible** components with ARIA labels

## 🌐 SEO

- **Meta tags** for social sharing
- **Open Graph** images
- **Structured data** for search engines
- **Sitemap** generation
- **Robots.txt** configuration

## 🐛 Debugging

- **Console logging** for development
- **Error boundaries** for React errors
- **API error handling** with proper status codes
- **Database query logging** in development

## 📊 Analytics

- **Built-in Next.js analytics** (if enabled)
- **Custom event tracking** for user actions
- **Performance monitoring** with Web Vitals
- **Error tracking** with console logging

## 🔄 State Management

- **React hooks** for local state
- **NextAuth session** for user state
- **Server state** with API routes
- **Form state** with React Hook Form

## 🎯 Key Features

1. **Landing Page**: Conversion-optimized marketing site
2. **Authentication**: Secure sign-in with email/Google
3. **Dashboard**: Meal preference form and history
4. **AI Generation**: 30-second meal plan creation
5. **PDF Export**: Beautiful, printable meal plans
6. **Email Delivery**: Automatic PDF delivery
7. **Subscription Management**: Stripe-powered billing
8. **Responsive Design**: Works on all devices

## 🚀 Getting Started Checklist

- [ ] Set up Supabase project
- [ ] Configure Stripe account
- [ ] Get OpenAI API key
- [ ] Set up Resend account
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed test data
- [ ] Start development servers
- [ ] Test meal plan generation
- [ ] Verify email delivery
- [ ] Test payment flow

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**: Check DATABASE_URL
2. **Authentication issues**: Verify NEXTAUTH_SECRET
3. **Stripe webhook failures**: Check webhook secret
4. **PDF generation errors**: Ensure PDFKit is installed
5. **Email delivery issues**: Verify Resend API key

### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
