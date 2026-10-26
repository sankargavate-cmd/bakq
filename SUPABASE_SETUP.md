# Shetkari Sathi — Supabase Setup Guide

This guide walks you through setting up your free Supabase project, executing all migrations, and connecting your local application.

---

## 1. Create a Free Supabase Project

1. Open [https://supabase.com](https://supabase.com) in your web browser.
2. Sign in (or sign up using GitHub / Google / email).
3. In your dashboard, click **"New Project"**.
4. Fill in the project details:
   - **Name:** `shetkari-sathi`
   - **Database Password:** Enter a strong password and save it somewhere secure.
   - **Region:** Select **South Asia (Mumbai) - `ap-south-1`** (recommended for lowest latency in India).
   - **Pricing Plan:** Free tier.
5. Click **"Create new project"**.
6. Wait 1–2 minutes for the database to provision.

---

## 2. Execute SQL Migrations

Navigate to the **SQL Editor** tab in your Supabase dashboard (icon looks like `>_` on the left sidebar).

Execute the migrations in the following order:

### Migration 1: Core Schema & RLS
1. Click **"New Query"**.
2. Open the file [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) on your computer.
3. Copy its entire contents and paste into the Supabase SQL editor.
4. Click the green **"Run"** button.
5. Verify the result displays: `Success. No rows returned`.

### Migration 2: Storage Buckets & Policies
1. Click **"New Query"**.
2. Open the file [`supabase/migrations/002_storage_buckets.sql`](./supabase/migrations/002_storage_buckets.sql).
3. Copy its entire contents, paste into the editor, and click **"Run"**.
4. Verify all 5 buckets (`produce-photos`, `profile-photos`, `documents`, `payment-evidence`, `delivery-proof`) are created.

### Migration 3: Seed Government Schemes
1. Click **"New Query"**.
2. Open the file [`supabase/migrations/003_seed_schemes.sql`](./supabase/migrations/003_seed_schemes.sql).
3. Copy its entire contents, paste into the editor, and click **"Run"**.
4. Check **Table Editor** > `government_schemes` to confirm 8 schemes are populated with Marathi, Hindi, and English details.

### Migration 4: Authentication Hook
1. Click **"New Query"**.
2. Open the file [`supabase/migrations/004_auth_hooks.sql`](./supabase/migrations/004_auth_hooks.sql).
3. Copy its entire contents, paste into the editor, and click **"Run"**.

---

## 3. Configure Supabase Authentication

1. Go to **Authentication** (User icon on left sidebar) > **Providers** > **Email**.
2. Settings:
   - **Enable Email provider:** `ON`
   - **Confirm email:** `ON` (recommended for production) or `OFF` (for rapid local testing)
3. Go to **Authentication** > **URL Configuration**:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** Add:
     - `http://localhost:3000/**`
     - `https://your-domain.vercel.app/**` (when deployed)

---

## 4. Get API Keys & Configure Frontend

1. Go to **Project Settings** (gear icon at bottom left) > **API**.
2. Under **Project URL**, copy the URL (e.g. `https://xyzprojectref.supabase.co`).
3. Under **Project API Keys**, copy the `anon` `public` key.
4. In your project, create `frontend/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application Info
NEXT_PUBLIC_APP_NAME=Shetkari Sathi
NEXT_PUBLIC_APP_VERSION=2.0.0
```

> [!WARNING]
> NEVER put `service_role` (secret) key into frontend code or `.env.local`. Only the `anon` key is safe for client-side use with Row Level Security.
