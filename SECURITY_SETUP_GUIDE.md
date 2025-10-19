# 🔒 WellPlate Security Setup Guide

## 📁 Files Created

I've created 3 SQL scripts for you:

1. **`supabase-rls-setup.sql`** - Main RLS security setup
2. **`supabase-storage-setup.sql`** - File storage security setup  
3. **`supabase-security-test.sql`** - Security verification tests

## 🚀 Step-by-Step Instructions

### **Step 1: Access Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your WellPlate project
3. Click on **"SQL Editor"** in the left sidebar

### **Step 2: Run RLS Setup**

1. Copy the contents of `supabase-rls-setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button
4. Wait for completion (should take 10-30 seconds)

**Expected Result**: You should see "WellPlate RLS setup completed successfully! 🎉"

### **Step 3: Run Storage Setup**

1. Copy the contents of `supabase-storage-setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button
4. Wait for completion

**Expected Result**: You should see "WellPlate Storage setup completed successfully! 📁"

### **Step 4: Verify Security (Optional but Recommended)**

1. Copy the contents of `supabase-security-test.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button
4. Review the security report

**Expected Result**: All status indicators should show ✅

## 🔍 What Each Script Does

### **RLS Setup Script**
- ✅ Enables Row Level Security on all tables
- ✅ Creates user isolation policies (users can only see their own data)
- ✅ Creates service role policies (your app can access all data)
- ✅ Prevents data leaks even if your app code has bugs

### **Storage Setup Script**
- ✅ Creates secure storage buckets for PDFs
- ✅ Sets up file size limits (10MB for PDFs)
- ✅ Ensures users can only access their own files
- ✅ Prevents unauthorized file access

### **Security Test Script**
- ✅ Verifies RLS is enabled on all tables
- ✅ Checks that policies are created correctly
- ✅ Tests data isolation is working
- ✅ Provides a security status report

## ⚠️ Important Notes

### **Before Running Scripts**
- ✅ Make sure you're in your **production Supabase project**
- ✅ Have a backup of your database (Supabase auto-backups are usually sufficient)
- ✅ Test in a development environment first if possible

### **After Running Scripts**
- ✅ Test your app to make sure everything still works
- ✅ Try logging in and generating a meal plan
- ✅ Verify users can only see their own data

## 🚨 Troubleshooting

### **If Scripts Fail**
1. **Check permissions**: Make sure you're logged in as project owner
2. **Check table names**: Ensure your tables match the exact names in the script
3. **Run one section at a time**: If the full script fails, try running sections individually

### **If App Stops Working**
1. **Check service role key**: Make sure your app is using the service role key
2. **Check authentication**: Verify NextAuth is working correctly
3. **Check API routes**: Ensure your API routes are using proper authentication

### **Common Issues**
- **"Policy already exists"**: This is normal, the script handles it
- **"Table doesn't exist"**: Check your table names in Prisma schema
- **"Permission denied"**: Make sure you're using the service role key in your app

## 📞 Need Help?

If you encounter any issues:

1. **Check the Supabase logs** in your dashboard
2. **Run the security test script** to see what's wrong
3. **Test with a simple query** like `SELECT COUNT(*) FROM "User"`
4. **Contact me** with the specific error message

## 🎯 Next Steps After Security Setup

1. ✅ **Test your app** - Make sure everything works
2. ✅ **Deploy to production** - Your database is now secure
3. ✅ **Monitor logs** - Watch for any security-related issues
4. ✅ **Update your launch checklist** - Mark security as complete

---

**Status**: 🔒 Database security setup ready to execute
**Time Required**: 5-10 minutes
**Risk Level**: Low (scripts are safe and reversible)
