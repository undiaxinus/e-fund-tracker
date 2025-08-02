# 🔗 Supabase Connection Testing Guide

This guide will help you verify if your Supabase configuration is working properly with the E-Fund Tracker application.

## 🚀 Quick Test Methods

### Method 1: PowerShell Script (Recommended for Windows)

```powershell
# Run from project root directory
.\scripts\test-connection.ps1
```

This script will:
- ✅ Check if Node.js is installed
- ✅ Verify project structure
- ✅ Validate environment configuration
- ✅ Test Supabase connection
- ✅ Provide troubleshooting tips

### Method 2: Node.js Script

```bash
# Run from project root directory
node scripts/test-supabase.js
```

### Method 3: Web UI Test

1. Start the Angular development server:
   ```bash
   ng serve
   ```

2. Open your browser and go to:
   ```
   http://localhost:4200/connection-test
   ```

3. Click "Test Connection" and "Test Authentication" buttons

## 📋 What Gets Tested

### Configuration Check
- ✅ Supabase URL format
- ✅ API key presence
- ✅ Environment file validity

### Connection Test
- ✅ Supabase client initialization
- ✅ Database connectivity
- ✅ Authentication endpoint
- ✅ Network accessibility

### Database Schema
- ✅ Required tables exist
- ✅ Row Level Security (RLS) policies
- ✅ User permissions

## 🔧 Common Issues & Solutions

### ❌ "Supabase not configured"

**Problem**: Environment variables not set properly

**Solution**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **anon/public key**
5. Update `src/environments/environment.ts`:

```typescript
export const environment = {
  // ... other settings
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-anon-key-here'
};
```

### ❌ "Database connection failed"

**Problem**: Database schema not set up

**Solution**:
1. Go to Supabase Dashboard > **SQL Editor**
2. Run these SQL files in order:
   - `sql/database_schema.sql`
   - `sql/create_admin_account.sql`
   - `sql/fix_rls_auth.sql`

### ❌ "relation 'users' does not exist"

**Problem**: Database tables not created

**Solution**:
1. Run `sql/database_schema.sql` in Supabase SQL Editor
2. This creates all required tables

### ❌ "JWT" or "RLS" errors

**Problem**: Row Level Security policies not configured

**Solution**:
1. Run `sql/fix_rls_auth.sql` in Supabase SQL Editor
2. This sets up proper authentication policies

### ❌ "Network" or "fetch" errors

**Problem**: Network connectivity issues

**Solution**:
1. Check internet connection
2. Verify Supabase URL is correct
3. Check firewall/proxy settings
4. Try accessing Supabase dashboard directly

## 🎯 Expected Results

### ✅ Successful Test Output

```
🔍 Supabase Connection Test
==================================================
📍 URL: https://your-project.supabase.co
🔑 Key: eyJhbGciOiJIUzI1NiIs...

🔄 Creating Supabase client...
✅ Client created successfully

🔄 Testing database connection...
✅ Database connection successful!
📊 Users table accessible (count query worked)

🔄 Testing authentication endpoint...
✅ Authentication endpoint is working

==================================================
🎉 Supabase connection test PASSED!
```

### ❌ Failed Test Output

```
❌ Database connection failed: relation "users" does not exist

📝 Database schema not set up:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the SQL files in the sql/ folder
```

## 🔍 Manual Verification

If automated tests fail, you can manually verify:

### 1. Check Supabase Dashboard
- Can you access your project dashboard?
- Are the tables visible in the Table Editor?
- Do you see users in the Authentication section?

### 2. Test API Directly
Open browser console and run:

```javascript
// Test if Supabase URL is accessible
fetch('https://your-project.supabase.co/rest/v1/')
  .then(response => console.log('API accessible:', response.status))
  .catch(error => console.error('API error:', error));
```

### 3. Check Environment File
Verify `src/environments/environment.ts` contains:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-actual-project.supabase.co', // Real URL
  supabaseAnonKey: 'eyJ...', // Real key (starts with eyJ)
  // ... other settings
};
```

## 📞 Getting Help

If you're still having issues:

1. **Check the setup guide**: `SUPABASE_SETUP.md`
2. **Review Supabase docs**: [supabase.com/docs](https://supabase.com/docs)
3. **Verify your project settings** in Supabase dashboard
4. **Check browser console** for additional error messages
5. **Try the web UI test** at `/connection-test` for visual feedback

## 🎉 Success!

Once your connection test passes:

1. **Start the app**: `ng serve`
2. **Visit**: `http://localhost:4200`
3. **Login with admin credentials**:
   - Email: `admin@efund.gov.ph`
   - Password: `admin123456`
4. **Explore the application features**

---

**Note**: The application has fallback mock data, so it will work even without Supabase, but for full functionality and data persistence, a proper Supabase connection is required.