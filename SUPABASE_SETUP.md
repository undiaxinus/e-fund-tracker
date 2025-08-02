# Supabase Setup Guide para sa E-Fund Tracker

## 📋 Mga Kailangan

1. **Supabase Account** - Mag-signup sa [supabase.com](https://supabase.com)
2. **Database Schema** - I-setup ang tables gamit ang provided SQL files

## 🚀 Step-by-Step Setup

### 1. Gumawa ng Supabase Project

1. Pumunta sa [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Piliin ang organization
4. I-type ang project name (e.g., "e-fund-tracker")
5. Gumawa ng secure password para sa database
6. Piliin ang region (Singapore para sa Pilipinas)
7. Click "Create new project"

### 2. I-setup ang Database Schema

1. Sa Supabase dashboard, pumunta sa **SQL Editor**
2. I-copy at i-paste ang content ng `sql/database_schema.sql`
3. Click "Run" para ma-create ang tables
4. I-run din ang `sql/create_admin_account.sql` para sa admin account

### 3. Kunin ang API Keys

1. Pumunta sa **Settings** > **API**
2. I-copy ang:
   - **Project URL** (nasa Project Settings)
   - **anon/public key** (nasa API Keys section)

### 4. I-update ang Environment Configuration

1. Buksan ang `src/environments/environment.ts`
2. I-replace ang values:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project-ref.supabase.co', // I-paste dito ang Project URL
  supabaseAnonKey: 'your-anon-key-here', // I-paste dito ang anon key
  // ... other settings
};
```

### 5. I-setup ang Row Level Security (RLS)

1. Sa Supabase dashboard, pumunta sa **Authentication** > **Policies**
2. I-enable ang RLS sa lahat ng tables
3. I-run ang `sql/fix_rls_auth.sql` para sa security policies

### 6. Mag-create ng Test Users

1. Pumunta sa **Authentication** > **Users**
2. Click "Add user"
3. I-create ang mga test accounts:
   - admin2@efund.gov.ph (password: admin123456)
   - encoder@efund.gov.ph (password: encoder123)
   - viewer@efund.gov.ph (password: viewer123)

## 🔧 Troubleshooting

### Kung hindi nag-connect ang app:

1. **Check ang URL format** - Dapat may `https://` at walang trailing slash
2. **Verify ang API key** - Siguraduhing tama ang anon key
3. **Check ang network** - Siguraduhing may internet connection

### Kung may authentication errors:

1. **Enable Email Auth** sa Supabase dashboard
2. **Check ang RLS policies** - Siguraduhing naka-setup ng tama
3. **Verify user roles** sa database

## 📊 Database Tables

Ang system ay gumagamit ng mga tables na ito:

- `users` - User accounts at roles
- `disbursements` - Main disbursement records
- `audit_logs` - System activity logs
- `classification_config` - Expense classifications
- `system_config` - System settings

## 🔐 Security Notes

- **Hindi i-commit ang actual API keys** sa Git
- **Gumamit ng environment variables** para sa production
- **I-enable ang RLS** sa lahat ng sensitive tables
- **Regular na mag-backup** ng database

## 📞 Support

Kung may problema sa setup:

1. Check ang Supabase documentation
2. Verify ang SQL schema
3. Test ang connection sa browser console
4. Check ang network at firewall settings

---

**Note**: Ang application ay may fallback sa mock data kung hindi naka-configure ang Supabase, pero para sa production use, kailangan ng proper Supabase setup.