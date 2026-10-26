# Shetkari Sathi — Production Deployment Checklist & Runbook

**Version:** 2.0.0 (Production Release)  
**Target Environment:** Vercel / Cloudflare Pages / Self-hosted Node.js (Frontend) + Supabase Enterprise/Cloud (Backend)  
**Architecture:** Next.js 15 (App Router, React 19) + Supabase (PostgreSQL 15, Auth, Storage, RLS)  

---

## 1. Architecture Transition Summary

| Component | Legacy State (Retired) | Production State (Active) |
|---|---|---|
| **Frontend Framework** | Next.js 15 (with mixed direct Firebase calls) | Next.js 15 with type-safe Supabase PostgREST & Auth client |
| **Backend API** | Express / MongoDB / Prisma on port 5000 | Native Supabase PostgREST with 24 normalized PostgreSQL tables |
| **Authentication** | Firebase Client Auth with exposed API keys | Supabase Auth with secure session cookies & role escalation hooks |
| **Database** | MongoDB cluster (disconnected from UI) | Supabase PostgreSQL with Row Level Security (RLS) on all 24 tables |
| **Object Storage** | Firebase Storage | 5 Supabase Storage Buckets with RLS policies |
| **Payments** | Cashfree online gateway (mock/sandbox) | **Strictly offline** cash & UPI ledger with dual-party independent verification |

---

## 2. Prerequisites

1. **Supabase Cloud Project** (or self-hosted Supabase instance) with PostgreSQL 15+.
2. **Vercel / Hosting Account** with GitHub/GitLab repository access.
3. **Domain Name & SSL** (managed via Vercel or Cloudflare).
4. **Node.js 18+ or 20+** LTS runtime.

---

## 3. Supabase Project Setup (Database & Storage)

### Step 3.1: Create Project
1. Log in to [Supabase Management Console](https://supabase.com/dashboard).
2. Click **New Project** and select your closest AWS/GCP region (e.g., `ap-south-1` Mumbai for Indian users).
3. Record your database password and generate project keys.

### Step 3.2: Run Database Migrations in Order
Navigate to the **SQL Editor** in Supabase and execute the following 4 migration scripts located in `supabase/migrations/`:

1. **`001_initial_schema.sql`**
   - Creates 20 custom enums and 24 normalized tables.
   - Establishes relational integrity, cascading rules, and check constraints.
   - Creates rating calculation and receipt generation triggers.
   - Enables RLS on all 24 tables with strict role-based access policies.
2. **`002_storage_buckets.sql`**
   - Configures 5 storage buckets:
     - `produce-photos` (Public read, authenticated farmer write).
     - `profile-photos` (Public read, authenticated user write).
     - `documents` (Private, owner & admin only).
     - `payment-evidence` (Private, agent/payer/payee & admin only).
     - `delivery-proof` (Private, transporter/farmer & admin only).
   - Enforces file size limits (5 MB) and MIME type allowlists (JPEG, PNG, WebP, PDF).
3. **`003_seed_schemes.sql`**
   - Seeds 8 verified Central & Maharashtra Government agricultural schemes.
   - Includes full trilingual metadata (English, Marathi, and Hindi), eligibility lists, and official application URLs.
4. **`004_auth_hooks.sql`**
   - Creates the `public.handle_new_user()` trigger on `auth.users`.
   - Enforces role isolation: blocks public self-registration as `ADMIN` or `SUPER_ADMIN` (automatically falls back to `FARMER`).
   - Automatically provisions initial sub-profiles.

### Step 3.3: Bootstrap Super Admin Account
Because public self-registration as an Admin is blocked, create the first Super Admin directly in SQL:
```sql
-- 1. Sign up a user normally via the app UI or Supabase Auth tab with email admin@shetkarisathi.org
-- 2. Run this SQL query to grant SUPER_ADMIN privileges:
UPDATE public.profiles
SET role = 'SUPER_ADMIN', account_status = 'APPROVED'
WHERE phone = '+919999999999' OR id = 'YOUR-AUTH-USER-UUID-HERE';

INSERT INTO public.admin_profiles (user_id, permissions)
VALUES ('YOUR-AUTH-USER-UUID-HERE', ARRAY['MANAGE_USERS', 'VERIFY_PROVIDERS', 'MANAGE_SCHEMES', 'MANAGE_PAYMENTS', 'RESOLVE_DISPUTES', 'VIEW_AUDIT_LOGS'])
ON CONFLICT (user_id) DO NOTHING;
```

---

## 4. Environment Variables Configuration

Create `.env.local` inside `frontend/` (or configure in Vercel Project Settings):

```ini
# ============================================================
# Shetkari Sathi — Frontend Production Environment Variables
# ============================================================

# Supabase Public API (From Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-public-jwt>

# Application Details
NEXT_PUBLIC_APP_NAME=Shetkari Sathi
NEXT_PUBLIC_APP_VERSION=2.0.0

# Optional Sentry / Error Monitoring
# NEXT_PUBLIC_SENTRY_DSN=
```

> [!CAUTION]
> **NEVER expose `SUPABASE_SERVICE_ROLE_KEY`** in the frontend client, `.env.local`, or any repository commit. All client operations run through Supabase Auth JWTs constrained by Row Level Security.

---

## 5. Deployment Options

### Option A: Vercel (Recommended)
1. Push repository to GitHub/GitLab.
2. In Vercel, click **Add New Project** and select the repository.
3. Configure settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

### Option B: Self-Hosted Docker / VPS
1. Run `npm install` and `npm run build` in `frontend/`.
2. Start using PM2:
   ```bash
   pm2 start npm --name "shetkari-sathi" -- start --prefix frontend -- -p 3000
   ```
3. Configure NGINX reverse proxy with SSL terminating at port 3000.

---

## 6. Post-Deployment Verification Matrix (All 7 Personas)

Execute these smoke tests to certify production readiness:

| Persona | Test Flow | Expected Result | Verified |
|---|---|---|:---:|
| **1. Public User** | Visit `/` and `/schemes` without logging in | Landing page renders, schemes list loads with language tabs (EN, MR, HI) | [x] |
| **2. Farmer** | Register via `/auth` with phone, log in, create produce listing with photo upload | Produce appears on `/buyer/marketplace`, image uploaded to `produce-photos` | [x] |
| **3. Buyer** | Browse produce, submit purchase offer, negotiate price | Offer recorded, counter-offer visible in Farmer's `/farmer/offers` | [x] |
| **4. Labour** | Register as Labourer, set daily wage and skills | Profile listed in Farmer's Labour Search; Farmer can send Work Request | [x] |
| **5. Tractor Owner** | Register tractor, set hourly/daily rates, receive booking request | Booking date conflict prevention blocks double-booking; booking confirmed | [x] |
| **6. Transporter** | Accept transport booking, deliver shipment with 6-digit OTP | Farmer provides OTP; Transporter verifies OTP to complete delivery | [x] |
| **7. Payment Agent** | Access `/payments` and `/agent/cashbook`, record cash collection | Receipt `RCPT-YYYYMMDD-XXXXXXXX` generated; outstanding balance recalculated; Agent ledger credited | [x] |
| **8. Admin** | Access `/admin`, review pending verification queue, verify provider | Provider marked `APPROVED`; audit log recorded; verification badge visible | [x] |

---

## 7. Security & Compliance Safeguards

- **Zero Online Gateways:** No third-party payment gateways (Cashfree, Stripe, Razorpay) are connected or present in the bundle.
- **Independent Verification:** Database constraint `CHECK (verified_by_id IS NULL OR verified_by_id != agent_id)` enforces that payment agents cannot verify their own collections.
- **Privilege Separation:** Public registration assigns role `FARMER`, `BUYER`, `LABOUR`, `TRACTOR_OWNER`, `TRANSPORT_PROVIDER`, or `AUTHORIZED_PAYMENT_AGENT`. Privilege escalation to `ADMIN` or `SUPER_ADMIN` is prevented by DB trigger.
- **Append-Only Auditing:** `order_status_history` and `audit_logs` are strictly append-only.
- **Safe Session Management:** Automatic session restoration and token refresh managed securely via `@supabase/supabase-js`.

---

## 8. Backup & Maintenance Protocol

1. **Automated Database Backups:** Enabled via Supabase Cloud Daily Backups (Point-in-Time Recovery recommended for production).
2. **Database Health Monitoring:** Monitor via Supabase Database Health Metrics (CPU, Memory, Connection Pooler).
3. **Disaster Recovery:** In event of database corruption or failover, replay migration scripts `001` through `004` on a fresh instance and restore database dump via `pg_restore`.
