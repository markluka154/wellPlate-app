# 🚀 WellPlate Launch Checklist

## ✅ Completed Tasks
- [x] **Branding Consistency** - All NutriAI references updated to WellPlate

## 🔧 Critical Pre-Launch Tasks

### 1. Environment Variables Setup
- [ ] **Supabase Production Database**
  - [ ] Create production Supabase project
  - [ ] Set `DATABASE_URL` and `DIRECT_URL` for production
  - [ ] Configure Row Level Security (RLS) policies
  - [ ] Set up storage buckets for PDFs
  - [ ] Run production migrations: `pnpm db:push`

- [ ] **Stripe Production Setup**
  - [ ] Switch from test to live keys
  - [ ] Set `STRIPE_SECRET_KEY` (live key)
  - [ ] Set `STRIPE_PUBLISHABLE_KEY` (live key)
  - [ ] Configure production price IDs
  - [ ] Set up webhook endpoint for production
  - [ ] Test payment flow in production

- [ ] **Authentication & Security**
  - [ ] Generate strong `NEXTAUTH_SECRET` for production
  - [ ] Set production `NEXTAUTH_URL` (your domain)
  - [ ] Configure Google OAuth for production domain
  - [ ] Test authentication flows

- [ ] **Email Service (Resend)**
  - [ ] Set production `RESEND_API_KEY`
  - [ ] Configure sender domain
  - [ ] Test email delivery
  - [ ] Set up email templates

- [ ] **AI Service**
  - [ ] Set production `OPENAI_API_KEY`
  - [ ] Configure worker service production URL
  - [ ] Test meal plan generation

### 2. Deployment Configuration
- [ ] **Vercel Deployment**
  - [ ] Connect GitHub repository
  - [ ] Set all environment variables in Vercel dashboard
  - [ ] Configure custom domain
  - [ ] Set up SSL certificate
  - [ ] Test deployment

- [ ] **Worker Service (Render)**
  - [ ] Deploy worker service to Render
  - [ ] Set environment variables
  - [ ] Configure CORS for production domain
  - [ ] Test worker endpoints

### 3. Testing & Quality Assurance
- [ ] **Run Test Suite**
  ```bash
  # Web app tests
  cd apps/web
  pnpm test
  pnpm test:e2e
  
  # Worker service tests
  cd apps/worker
  poetry run pytest tests/ -v
  ```

- [ ] **Production Testing**
  - [ ] Test user registration/sign-in
  - [ ] Test meal plan generation
  - [ ] Test PDF generation and email delivery
  - [ ] Test payment processing
  - [ ] Test all user flows end-to-end

### 4. Domain & SSL Setup
- [ ] **Custom Domain**
  - [ ] Purchase domain (if not done)
  - [ ] Configure DNS records
  - [ ] Set up subdomain for worker service
  - [ ] Test domain resolution

- [ ] **SSL Certificates**
  - [ ] Verify SSL is working
  - [ ] Test HTTPS redirects
  - [ ] Check certificate validity

### 5. Monitoring & Analytics
- [ ] **Error Tracking**
  - [ ] Set up Sentry or similar service
  - [ ] Configure error reporting
  - [ ] Test error tracking

- [ ] **Analytics**
  - [ ] Set up Google Analytics
  - [ ] Configure conversion tracking
  - [ ] Set up Facebook Pixel (if using)

- [ ] **Performance Monitoring**
  - [ ] Set up Vercel Analytics
  - [ ] Monitor Core Web Vitals
  - [ ] Set up uptime monitoring

### 6. Legal & Compliance
- [ ] **Terms of Service**
  - [ ] Review and update terms
  - [ ] Ensure compliance with local laws
  - [ ] Add refund policy

- [ ] **Privacy Policy**
  - [ ] Review privacy policy
  - [ ] Ensure GDPR compliance
  - [ ] Add cookie policy

- [ ] **Data Protection**
  - [ ] Review data handling practices
  - [ ] Ensure secure data storage
  - [ ] Set up data backup procedures

### 7. Marketing & Launch Preparation
- [ ] **Landing Page**
  - [ ] Review and optimize landing page
  - [ ] Test conversion flows
  - [ ] Optimize for SEO

- [ ] **Social Media**
  - [ ] Prepare launch announcements
  - [ ] Set up social media accounts
  - [ ] Create launch content

- [ ] **Customer Support**
  - [ ] Set up support email
  - [ ] Create FAQ content
  - [ ] Prepare support documentation

## 🚨 Critical Production Environment Variables

### Web App (.env.local)
```bash
# Production Configuration
NEXT_PUBLIC_APP_NAME=WellPlate
NEXTAUTH_SECRET=your-production-secret-32-chars-min
NEXTAUTH_URL=https://your-domain.com
PORT=4321

# Production Database
DATABASE_URL=postgresql://postgres:password@your-supabase-host:5432/wellplate
DIRECT_URL=postgresql://postgres:password@your-supabase-host:5432/wellplate

# Production Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Production Stripe
STRIPE_SECRET_KEY=sk_live_your-live-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-stripe-publishable-key
STRIPE_PRICE_PRO_MONTHLY_EUR=price_your-production-monthly-price-id
STRIPE_PRICE_PRO_ANNUAL_EUR=price_your-production-annual-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret

# Production Email
RESEND_API_KEY=re_your-production-resend-api-key

# Production Worker Service
WORKER_URL=https://your-worker-domain.com

# Production OpenAI
OPENAI_API_KEY=sk-your-production-openai-api-key

# Production Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

### Worker Service (.env)
```bash
# Production OpenAI
OPENAI_API_KEY=sk-your-production-openai-api-key

# Production CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Production Server
PORT=8420
```

## 🎯 Launch Day Checklist
- [ ] All environment variables set
- [ ] All services deployed and tested
- [ ] Domain and SSL working
- [ ] Payment processing tested
- [ ] Email delivery working
- [ ] Error tracking active
- [ ] Analytics configured
- [ ] Legal pages updated
- [ ] Support channels ready
- [ ] Launch announcement prepared

## 📞 Emergency Contacts
- **Technical Issues**: [Your contact]
- **Payment Issues**: Stripe Support
- **Domain Issues**: Domain registrar support
- **Hosting Issues**: Vercel/Render support

---

**Status**: 🟡 In Progress - Branding Complete, Environment Setup Next
**Last Updated**: $(date)
