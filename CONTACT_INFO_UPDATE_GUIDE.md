# Contact Information Update Guide

## Replace These Placeholders:

### Email Addresses:
- `privacy@wellplate.eu` → Your actual privacy/data protection email
- `legal@wellplate.eu` → Your actual legal email  
- `hello@wellplate.eu` → Your actual support email

### Business Address:
- `[Your Business Address]` → Your actual business address

## Files to Update:

1. **apps/web/src/app/(marketing)/privacy/page.tsx**
   - Lines: 142, 211, 214, 217

2. **apps/web/src/app/(marketing)/terms/page.tsx**
   - Lines: 246, 274, 277, 280

3. **apps/web/src/components/dashboard/GDPRCompliancePanel.tsx**
   - Lines: 266, 298

4. **apps/web/src/components/auth/ConsentForm.tsx**
   - Line: 208

5. **apps/web/src/components/layout/Footer.tsx**
   - Line: 75

6. **apps/web/src/lib/auth.ts**
   - Lines: 36, 61

7. **apps/web/src/app/api/user/export-data/route.ts**
   - Line: 105

## Example Updates:

### Privacy Email:
```typescript
// Change this:
<a href="mailto:privacy@wellplate.eu" className="text-blue-600 hover:underline">

// To this:
<a href="mailto:privacy@yourdomain.com" className="text-blue-600 hover:underline">
```

### Business Address:
```typescript
// Change this:
<strong>Address:</strong> [Your Business Address]

// To this:
<strong>Address:</strong> Your Company Name, 123 Main St, City, Country
```

## After Updates:
1. Test the pages to ensure links work
2. Commit and push changes
3. Verify in production deployment
