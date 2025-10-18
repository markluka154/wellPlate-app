# Meta Pixel + Conversions API Environment Variables

Add these to your `.env.local` file:

```bash
# Meta Pixel Configuration
META_PIXEL_ID=788765987308138
NEXT_PUBLIC_META_PIXEL_ID=788765987308138

# Meta Conversions API (CAPI) - Get from Meta Events Manager
META_CAPI_TOKEN=<REPLACE_WITH_YOUR_ACCESS_TOKEN_FROM_EVENTS_MANAGER>

# Stripe Configuration (existing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔑 How to Get Your Meta CAPI Token:

1. **Go to Meta Events Manager** → https://business.facebook.com/events_manager
2. **Select your Pixel** (ID: 788765987308138)
3. **Go to Settings** → Conversions API
4. **Click "Generate Access Token"**
5. **Copy the token** and replace `<REPLACE_WITH_YOUR_ACCESS_TOKEN_FROM_EVENTS_MANAGER>` in your `.env.local`

## 🧪 Testing Mode:

For testing, you can temporarily add this to your `metaCapi.ts`:

```typescript
// Add this line before sending the payload
payload.test_event_code = "<YOUR_TEST_EVENT_CODE>";
```

Get your test event code from Meta Events Manager → Test Events.

## 🚀 Production Ready:

- ✅ **GDPR Compliant** - Emails are SHA-256 hashed
- ✅ **Dual Tracking** - Both Pixel (client) and CAPI (server) events
- ✅ **Automatic Deduplication** - Meta handles duplicate events
- ✅ **Error Handling** - Graceful fallbacks if CAPI fails
- ✅ **Real Currency** - EUR with proper decimal values
