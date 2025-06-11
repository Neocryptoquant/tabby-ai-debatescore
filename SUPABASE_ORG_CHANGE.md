# How to Change Supabase Organization

## Option 1: Transfer Existing Project (Recommended if you want to keep data)

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your current project

2. **Transfer Project**
   - Go to Settings → General
   - Scroll down to "Transfer project"
   - Enter the email/username of the target organization
   - Confirm the transfer

## Option 2: Create New Project in Correct Organization

1. **Create New Project**
   - Switch to the correct organization in Supabase dashboard
   - Create a new project
   - Note down the new project URL and keys

2. **Update Your Code**
   - Update `src/integrations/supabase/client.ts` with new credentials
   - Update `supabase/config.toml` with new project ID

3. **Migrate Data (if needed)**
   - Export data from old project
   - Import to new project
   - Or recreate the database schema

## Option 3: Change Organization Ownership

1. **Organization Settings**
   - Go to your organization settings
   - Transfer ownership to the correct account
   - Or invite the correct account as an admin

## Current Project Details

Your current project:
- Project ID: `xzrgoudfoiwrytrdjozn`
- URL: `https://xzrgoudfoiwrytrdjozn.supabase.co`

## What You'll Need to Update

If you create a new project, update these files:

### 1. `src/integrations/supabase/client.ts`
```typescript
const SUPABASE_URL = "YOUR_NEW_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_NEW_ANON_KEY";
```

### 2. `supabase/config.toml`
```toml
project_id = "your_new_project_id"
```

### 3. Environment Variables (if using)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema Recreation

If you create a new project, you'll need to recreate your database schema. Your current schema includes:
- tournaments table
- teams table
- rounds table
- draws table
- judges table
- user_roles table
- profiles table
- And other related tables

## Recommendation

I recommend **Option 1 (Transfer)** if:
- You have important data you want to keep
- You're working with a team

I recommend **Option 2 (New Project)** if:
- You're just getting started
- You don't have important data yet
- You want a clean slate

Let me know which option you prefer and I can help you with the specific steps!