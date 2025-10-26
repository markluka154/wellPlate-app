# Fix "Prepared Statement Already Exists" Error

## Problem
You're seeing this error in Vercel production:
```
ERROR: prepared statement "s0" already exists
```

## Root Cause
Supabase connection pooler is in **Transaction mode** (port 6543), which doesn't support prepared statements that Prisma uses.

## Solution: Add `?pgbouncer=true` to DATABASE_URL

### For Vercel:
1. Go to your Vercel project: https://vercel.com/markluka154s-projects/wellplate-app
2. Open **Project Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Add `?pgbouncer=true` to the end
5. It should look like:
   ```
   postgresql://postgres.ncwygxhmxygxvdtewcpn:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Save** and **Redeploy**

### What This Does:
- `?pgbouncer=true` tells Prisma to **NOT use prepared statements**
- This prevents the "already exists" conflict
- Prisma will use regular SQL queries instead

## Alternative: Use Session Mode

If the above doesn't work, connect to Supabase on **port 5432** (Session mode):

```
postgresql://postgres.ncwygxhmxygxvdtewcpn:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Session mode doesn't have prepared statement conflicts but has connection limits.

## Expected Result
After updating and redeploying:
- ✅ No more "prepared statement already exists" errors
- ✅ Family dashboard loads correctly
- ✅ All Prisma queries work normally


