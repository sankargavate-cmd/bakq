-- ============================================================
-- Shetkari Sathi — Migration 001: Initial Schema
-- Date: 2026-10-22
-- Description: Core schema, enums, tables, functions, triggers,
--              RLS policies, and performance indexes.
-- ============================================================

-- Enable pgcrypto / uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'FARMER',
    'LABOUR',
    'TRACTOR_OWNER',
    'MACHINERY_PROVIDER',
    'BUYER',
    'TRANSPORT_PROVIDER',
    'AUTHORIZED_PAYMENT_AGENT',
    'ADMIN',
    'SUPER_ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE produce_unit AS ENUM (
    'KG',
    'QUINTAL',
    'TON',
    'DOZEN',
    'LITRE',
    'PIECE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE capacity_unit AS ENUM (
    'KG',
    'QUINTAL',
    'TON'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE work_request_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tractor_booking_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tractor_rate_type AS ENUM (
    'HOURLY',
    'DAILY'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transport_booking_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transport_rate_type AS ENUM (
    'PER_KM',
    'PER_TRIP'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE offer_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'READY',
    'PICKUP',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rating_target_type AS ENUM (
    'LABOUR',
    'TRACTOR',
    'TRANSPORT',
    'BUYER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'AADHAAR_CARD',
    'PAN_CARD',
    'PROFILE_PHOTO',
    'BANK_PASSBOOK',
    'SEVEN_TWELVE_EXTRACT',
    'LAND_OWNERSHIP_PROOF',
    'DRIVING_LICENSE',
    'TRACTOR_RC',
    'VEHICLE_RC',
    'TRANSPORT_PERMIT',
    'GST_CERTIFICATE',
    'SHOP_ESTABLISHMENT_LICENSE',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE offline_payment_status AS ENUM (
    'PENDING',
    'SUBMITTED',
    'VERIFIED',
    'REJECTED',
    'REFUNDED',
    'REVERSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE offline_payment_method AS ENUM (
    'CASH',
    'UPI'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_purpose AS ENUM (
    'WORK_REQUEST',
    'TRACTOR_BOOKING',
    'TRANSPORT_BOOKING',
    'PRODUCE_ORDER',
    'PLATFORM_FEE',
    'COMMISSION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE commission_status AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'DISMISSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_category AS ENUM (
    'PAYMENT',
    'SERVICE_QUALITY',
    'FRAUD',
    'BOOKING',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. HELPER FUNCTIONS FOR SECURITY & ROLES
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_account_status()
RETURNS account_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN') AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- 3.1 profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  account_status account_status NOT NULL DEFAULT 'PENDING',
  preferred_language TEXT NOT NULL DEFAULT 'en',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  state TEXT,
  district TEXT,
  taluka TEXT,
  village TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 farmer_profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_photo TEXT,
  mobile TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  farming_experience_years INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 labour_profiles
CREATE TABLE IF NOT EXISTS public.labour_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_photo TEXT,
  mobile TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  daily_wage NUMERIC(10,2) NOT NULL CHECK (daily_wage > 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  average_rating NUMERIC(3,2) CHECK (average_rating BETWEEN 1.0 AND 5.0),
  rating_count INT NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 tractor_profiles
CREATE TABLE IF NOT EXISTS public.tractor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photos TEXT[] NOT NULL DEFAULT '{}',
  mobile TEXT NOT NULL,
  tractor_type TEXT NOT NULL,
  model TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  rate_per_hour NUMERIC(10,2),
  rate_per_day NUMERIC(10,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  average_rating NUMERIC(3,2) CHECK (average_rating BETWEEN 1.0 AND 5.0),
  rating_count INT NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_tractor_rates CHECK (rate_per_hour IS NOT NULL OR rate_per_day IS NOT NULL)
);

-- 3.5 transport_profiles
CREATE TABLE IF NOT EXISTS public.transport_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photos TEXT[] NOT NULL DEFAULT '{}',
  mobile TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  capacity NUMERIC(10,2) NOT NULL CHECK (capacity > 0),
  capacity_unit capacity_unit NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  rate_per_km NUMERIC(10,2),
  rate_per_trip NUMERIC(10,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  average_rating NUMERIC(3,2) CHECK (average_rating BETWEEN 1.0 AND 5.0),
  rating_count INT NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_transport_rates CHECK (rate_per_km IS NOT NULL OR rate_per_trip IS NOT NULL)
);

-- 3.6 admin_profiles
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  removed_at TIMESTAMPTZ,
  removed_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.7 user_documents
CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_url TEXT NOT NULL,
  status verification_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.8 produce_listings
CREATE TABLE IF NOT EXISTS public.produce_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit produce_unit NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL CHECK (price_per_unit > 0),
  location TEXT NOT NULL,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  harvest_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.9 produce_offers
CREATE TABLE IF NOT EXISTS public.produce_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_price NUMERIC(12,2) NOT NULL CHECK (offer_price > 0),
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  message TEXT,
  status offer_status NOT NULL DEFAULT 'PENDING',
  responded_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID UNIQUE NOT NULL REFERENCES public.produce_offers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit produce_unit NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL CHECK (price_per_unit > 0),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
  status order_status NOT NULL DEFAULT 'PENDING',
  confirmed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.11 order_status_history (Append-only audit)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  changed_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 work_requests
CREATE TABLE IF NOT EXISTS public.work_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  labour_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_type TEXT NOT NULL,
  work_date DATE NOT NULL,
  location TEXT NOT NULL,
  wage NUMERIC(10,2) NOT NULL CHECK (wage > 0),
  message TEXT,
  status work_request_status NOT NULL DEFAULT 'PENDING',
  responded_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.13 tractor_bookings
CREATE TABLE IF NOT EXISTS public.tractor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tractor_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  location TEXT NOT NULL,
  rate_type tractor_rate_type NOT NULL,
  agreed_rate NUMERIC(10,2) NOT NULL CHECK (agreed_rate > 0),
  duration_units NUMERIC(6,2),
  message TEXT,
  status tractor_booking_status NOT NULL DEFAULT 'PENDING',
  responded_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.14 transport_bookings
CREATE TABLE IF NOT EXISTS public.transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transport_provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goods_type TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  booking_date DATE NOT NULL,
  rate_type transport_rate_type NOT NULL,
  agreed_rate NUMERIC(10,2) NOT NULL CHECK (agreed_rate > 0),
  distance_km NUMERIC(8,2),
  message TEXT,
  status transport_booking_status NOT NULL DEFAULT 'PENDING',
  responded_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  delivery_otp_hash TEXT,
  delivery_otp_verified_at TIMESTAMPTZ,
  delivery_proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.15 ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type rating_target_type NOT NULL,
  work_request_id UUID UNIQUE REFERENCES public.work_requests(id) ON DELETE CASCADE,
  tractor_booking_id UUID UNIQUE REFERENCES public.tractor_bookings(id) ON DELETE CASCADE,
  transport_booking_id UUID UNIQUE REFERENCES public.transport_bookings(id) ON DELETE CASCADE,
  order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_rating_reference CHECK (
    (work_request_id IS NOT NULL)::int +
    (tractor_booking_id IS NOT NULL)::int +
    (transport_booking_id IS NOT NULL)::int +
    (order_id IS NOT NULL)::int = 1
  )
);

-- 3.16 government_schemes
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_mr TEXT,
  title_hi TEXT,
  short_code TEXT UNIQUE,
  category TEXT NOT NULL,
  authority TEXT NOT NULL,
  description TEXT NOT NULL,
  description_mr TEXT,
  description_hi TEXT,
  eligibility TEXT[] NOT NULL DEFAULT '{}',
  eligibility_mr TEXT[] NOT NULL DEFAULT '{}',
  required_docs JSONB NOT NULL DEFAULT '[]',
  max_benefit TEXT,
  subsidy_percent TEXT,
  deadline TEXT,
  official_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.17 offline_payments
CREATE TABLE IF NOT EXISTS public.offline_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purpose payment_purpose NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  outstanding_balance NUMERIC(12,2) GENERATED ALWAYS AS (amount - amount_paid) STORED,
  method offline_payment_method NOT NULL,
  upi_reference TEXT,
  payment_evidence_url TEXT,
  status offline_payment_status NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_agent_not_verifier CHECK (verified_by_id IS NULL OR agent_id IS NULL OR verified_by_id != agent_id)
);

-- 3.18 payment_partial_records
CREATE TABLE IF NOT EXISTS public.payment_partial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.offline_payments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  method offline_payment_method NOT NULL,
  upi_reference TEXT,
  evidence_url TEXT,
  recorded_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.19 agent_cashbooks
CREATE TABLE IF NOT EXISTS public.agent_cashbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_collected NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_disbursed NUMERIC(14,2) NOT NULL DEFAULT 0,
  balance NUMERIC(14,2) GENERATED ALWAYS AS (total_collected - total_disbursed) STORED,
  last_reconciled_at TIMESTAMPTZ,
  reconciled_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.20 agent_cashbook_entries
CREATE TABLE IF NOT EXISTS public.agent_cashbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashbook_id UUID NOT NULL REFERENCES public.agent_cashbooks(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.offline_payments(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('CREDIT','DEBIT','ADJUSTMENT')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  approved_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.21 agent_commissions
CREATE TABLE IF NOT EXISTS public.agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.offline_payments(id) ON DELETE CASCADE,
  commission_rate NUMERIC(5,4) NOT NULL CHECK (commission_rate > 0 AND commission_rate <= 1),
  commission_amount NUMERIC(12,2) NOT NULL CHECK (commission_amount > 0),
  status commission_status NOT NULL DEFAULT 'PENDING',
  approved_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.22 complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category complaint_category NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  status complaint_status NOT NULL DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.23 audit_logs (Append-only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.24 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ============================================================

-- 4.1 updated_at triggers
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles', 'farmer_profiles', 'labour_profiles', 'tractor_profiles',
    'transport_profiles', 'admin_profiles', 'user_documents', 'produce_listings',
    'produce_offers', 'orders', 'work_requests', 'tractor_bookings',
    'transport_bookings', 'ratings', 'government_schemes', 'offline_payments',
    'agent_cashbooks', 'agent_commissions', 'complaints'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;
      CREATE TRIGGER trg_set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;

-- 4.2 Auto-generate receipt number if missing
CREATE OR REPLACE FUNCTION public.fn_generate_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR trim(NEW.receipt_number) = '' THEN
    NEW.receipt_number := 'RCPT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_receipt_number ON public.offline_payments;
CREATE TRIGGER trg_generate_receipt_number
  BEFORE INSERT ON public.offline_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_generate_receipt_number();

-- 4.3 Recompute rating stats for Labour, Tractor, Transport
CREATE OR REPLACE FUNCTION public.fn_recompute_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_type rating_target_type;
  v_ratee_id UUID;
  v_avg NUMERIC(3,2);
  v_count INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_target_type := OLD.target_type;
    v_ratee_id := OLD.ratee_id;
  ELSE
    v_target_type := NEW.target_type;
    v_ratee_id := NEW.ratee_id;
  END IF;

  SELECT round(avg(rating)::numeric, 2), count(*)
    INTO v_avg, v_count
    FROM public.ratings
   WHERE ratee_id = v_ratee_id AND target_type = v_target_type;

  IF v_target_type = 'LABOUR' THEN
    UPDATE public.labour_profiles
       SET average_rating = v_avg, rating_count = v_count
     WHERE user_id = v_ratee_id;
  ELSIF v_target_type = 'TRACTOR' THEN
    UPDATE public.tractor_profiles
       SET average_rating = v_avg, rating_count = v_count
     WHERE user_id = v_ratee_id;
  ELSIF v_target_type = 'TRANSPORT' THEN
    UPDATE public.transport_profiles
       SET average_rating = v_avg, rating_count = v_count
     WHERE user_id = v_ratee_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_ratings ON public.ratings;
CREATE TRIGGER trg_recompute_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_recompute_ratings();

-- 4.4 Auto-create cashbook on agent profile creation
CREATE OR REPLACE FUNCTION public.fn_auto_create_agent_cashbook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role = 'AUTHORIZED_PAYMENT_AGENT' THEN
    INSERT INTO public.agent_cashbooks (agent_id)
    VALUES (NEW.id)
    ON CONFLICT (agent_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_agent_cashbook ON public.profiles;
CREATE TRIGGER trg_auto_create_agent_cashbook
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_create_agent_cashbook();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS across all 24 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tractor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_partial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_cashbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_cashbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5.1 profiles
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (
    -- Normal users cannot self-escalate role, change account status, or deactivate themselves via RLS
    (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.is_admin_or_super()
  );

-- 5.2 farmer_profiles
DROP POLICY IF EXISTS "farmer_select" ON public.farmer_profiles;
CREATE POLICY "farmer_select" ON public.farmer_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_verified = true OR public.is_admin_or_super());

DROP POLICY IF EXISTS "farmer_insert_own" ON public.farmer_profiles;
CREATE POLICY "farmer_insert_own" ON public.farmer_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "farmer_update" ON public.farmer_profiles;
CREATE POLICY "farmer_update" ON public.farmer_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (
    -- Normal user cannot modify verification status
    (user_id = auth.uid() AND is_verified = (SELECT f.is_verified FROM public.farmer_profiles f WHERE f.user_id = auth.uid()))
    OR public.is_admin_or_super()
  );

-- 5.3 labour_profiles
DROP POLICY IF EXISTS "labour_select" ON public.labour_profiles;
CREATE POLICY "labour_select" ON public.labour_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (is_verified = true AND is_available = true) OR public.is_admin_or_super());

DROP POLICY IF EXISTS "labour_insert_own" ON public.labour_profiles;
CREATE POLICY "labour_insert_own" ON public.labour_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "labour_update" ON public.labour_profiles;
CREATE POLICY "labour_update" ON public.labour_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (
    (user_id = auth.uid() AND is_verified = (SELECT l.is_verified FROM public.labour_profiles l WHERE l.user_id = auth.uid()))
    OR public.is_admin_or_super()
  );

-- 5.4 tractor_profiles
DROP POLICY IF EXISTS "tractor_select" ON public.tractor_profiles;
CREATE POLICY "tractor_select" ON public.tractor_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (is_verified = true AND is_available = true) OR public.is_admin_or_super());

DROP POLICY IF EXISTS "tractor_insert_own" ON public.tractor_profiles;
CREATE POLICY "tractor_insert_own" ON public.tractor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "tractor_update" ON public.tractor_profiles;
CREATE POLICY "tractor_update" ON public.tractor_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (
    (user_id = auth.uid() AND is_verified = (SELECT t.is_verified FROM public.tractor_profiles t WHERE t.user_id = auth.uid()))
    OR public.is_admin_or_super()
  );

-- 5.5 transport_profiles
DROP POLICY IF EXISTS "transport_select" ON public.transport_profiles;
CREATE POLICY "transport_select" ON public.transport_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (is_verified = true AND is_available = true) OR public.is_admin_or_super());

DROP POLICY IF EXISTS "transport_insert_own" ON public.transport_profiles;
CREATE POLICY "transport_insert_own" ON public.transport_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transport_update" ON public.transport_profiles;
CREATE POLICY "transport_update" ON public.transport_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (
    (user_id = auth.uid() AND is_verified = (SELECT tr.is_verified FROM public.transport_profiles tr WHERE tr.user_id = auth.uid()))
    OR public.is_admin_or_super()
  );

-- 5.6 admin_profiles
DROP POLICY IF EXISTS "admin_profiles_select" ON public.admin_profiles;
CREATE POLICY "admin_profiles_select" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "admin_profiles_super_admin_manage" ON public.admin_profiles;
CREATE POLICY "admin_profiles_super_admin_manage" ON public.admin_profiles
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN');

-- 5.7 user_documents
DROP POLICY IF EXISTS "user_docs_select" ON public.user_documents;
CREATE POLICY "user_docs_select" ON public.user_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "user_docs_insert" ON public.user_documents;
CREATE POLICY "user_docs_insert" ON public.user_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_docs_admin_update" ON public.user_documents;
CREATE POLICY "user_docs_admin_update" ON public.user_documents
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- 5.8 produce_listings
DROP POLICY IF EXISTS "listings_select" ON public.produce_listings;
CREATE POLICY "listings_select" ON public.produce_listings
  FOR SELECT TO authenticated
  USING (is_active = true OR farmer_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "listings_insert" ON public.produce_listings;
CREATE POLICY "listings_insert" ON public.produce_listings
  FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "listings_update" ON public.produce_listings;
CREATE POLICY "listings_update" ON public.produce_listings
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin_or_super())
  WITH CHECK (farmer_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "listings_delete" ON public.produce_listings;
CREATE POLICY "listings_delete" ON public.produce_listings
  FOR DELETE TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin_or_super());

-- 5.9 produce_offers
DROP POLICY IF EXISTS "offers_select" ON public.produce_offers;
CREATE POLICY "offers_select" ON public.produce_offers
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "offers_insert" ON public.produce_offers;
CREATE POLICY "offers_insert" ON public.produce_offers
  FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "offers_update" ON public.produce_offers;
CREATE POLICY "offers_update" ON public.produce_offers
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin_or_super());

-- 5.10 orders
DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "orders_update" ON public.orders;
CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin_or_super());

-- 5.11 order_status_history
DROP POLICY IF EXISTS "order_history_select" ON public.order_status_history;
CREATE POLICY "order_history_select" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR o.farmer_id = auth.uid())
    ) OR public.is_admin_or_super()
  );

DROP POLICY IF EXISTS "order_history_insert" ON public.order_status_history;
CREATE POLICY "order_history_insert" ON public.order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (changed_by_id = auth.uid());

-- 5.12 work_requests
DROP POLICY IF EXISTS "work_requests_select" ON public.work_requests;
CREATE POLICY "work_requests_select" ON public.work_requests
  FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR labour_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "work_requests_insert" ON public.work_requests;
CREATE POLICY "work_requests_insert" ON public.work_requests
  FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "work_requests_update" ON public.work_requests;
CREATE POLICY "work_requests_update" ON public.work_requests
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR labour_id = auth.uid() OR public.is_admin_or_super());

-- 5.13 tractor_bookings
DROP POLICY IF EXISTS "tractor_bookings_select" ON public.tractor_bookings;
CREATE POLICY "tractor_bookings_select" ON public.tractor_bookings
  FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR tractor_owner_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "tractor_bookings_insert" ON public.tractor_bookings;
CREATE POLICY "tractor_bookings_insert" ON public.tractor_bookings
  FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "tractor_bookings_update" ON public.tractor_bookings;
CREATE POLICY "tractor_bookings_update" ON public.tractor_bookings
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR tractor_owner_id = auth.uid() OR public.is_admin_or_super());

-- 5.14 transport_bookings
DROP POLICY IF EXISTS "transport_bookings_select" ON public.transport_bookings;
CREATE POLICY "transport_bookings_select" ON public.transport_bookings
  FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR transport_provider_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "transport_bookings_insert" ON public.transport_bookings;
CREATE POLICY "transport_bookings_insert" ON public.transport_bookings
  FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "transport_bookings_update" ON public.transport_bookings;
CREATE POLICY "transport_bookings_update" ON public.transport_bookings
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR transport_provider_id = auth.uid() OR public.is_admin_or_super());

-- 5.15 ratings
DROP POLICY IF EXISTS "ratings_select" ON public.ratings;
CREATE POLICY "ratings_select" ON public.ratings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "ratings_insert" ON public.ratings;
CREATE POLICY "ratings_insert" ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (rater_id = auth.uid());

-- 5.16 government_schemes
DROP POLICY IF EXISTS "schemes_select" ON public.government_schemes;
CREATE POLICY "schemes_select" ON public.government_schemes
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin_or_super());

DROP POLICY IF EXISTS "schemes_admin_manage" ON public.government_schemes;
CREATE POLICY "schemes_admin_manage" ON public.government_schemes
  FOR ALL TO authenticated
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- 5.17 offline_payments
DROP POLICY IF EXISTS "offline_payments_select" ON public.offline_payments;
CREATE POLICY "offline_payments_select" ON public.offline_payments
  FOR SELECT TO authenticated
  USING (
    payer_id = auth.uid() OR payee_id = auth.uid() OR agent_id = auth.uid() OR public.is_admin_or_super()
  );

DROP POLICY IF EXISTS "offline_payments_insert" ON public.offline_payments;
CREATE POLICY "offline_payments_insert" ON public.offline_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    agent_id = auth.uid() OR public.is_admin_or_super()
  );

DROP POLICY IF EXISTS "offline_payments_update" ON public.offline_payments;
CREATE POLICY "offline_payments_update" ON public.offline_payments
  FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_super() OR (agent_id = auth.uid() AND status = 'PENDING')
  );

-- 5.18 payment_partial_records
DROP POLICY IF EXISTS "partial_records_select" ON public.payment_partial_records;
CREATE POLICY "partial_records_select" ON public.payment_partial_records
  FOR SELECT TO authenticated
  USING (
    recorded_by_id = auth.uid() OR public.is_admin_or_super() OR
    EXISTS (
      SELECT 1 FROM public.offline_payments p
      WHERE p.id = payment_id AND (p.payer_id = auth.uid() OR p.payee_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "partial_records_insert" ON public.payment_partial_records;
CREATE POLICY "partial_records_insert" ON public.payment_partial_records
  FOR INSERT TO authenticated
  WITH CHECK (recorded_by_id = auth.uid() OR public.is_admin_or_super());

-- 5.19 agent_cashbooks & entries
DROP POLICY IF EXISTS "cashbooks_select" ON public.agent_cashbooks;
CREATE POLICY "cashbooks_select" ON public.agent_cashbooks
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "cashbook_entries_select" ON public.agent_cashbook_entries;
CREATE POLICY "cashbook_entries_select" ON public.agent_cashbook_entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_cashbooks ac
      WHERE ac.id = cashbook_id AND ac.agent_id = auth.uid()
    ) OR public.is_admin_or_super()
  );

DROP POLICY IF EXISTS "cashbooks_admin_all" ON public.agent_cashbooks;
CREATE POLICY "cashbooks_admin_all" ON public.agent_cashbooks
  FOR ALL TO authenticated
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- 5.20 agent_commissions
DROP POLICY IF EXISTS "commissions_select" ON public.agent_commissions;
CREATE POLICY "commissions_select" ON public.agent_commissions
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "commissions_admin_manage" ON public.agent_commissions;
CREATE POLICY "commissions_admin_manage" ON public.agent_commissions
  FOR ALL TO authenticated
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- 5.21 complaints
DROP POLICY IF EXISTS "complaints_select" ON public.complaints;
CREATE POLICY "complaints_select" ON public.complaints
  FOR SELECT TO authenticated
  USING (complainant_id = auth.uid() OR respondent_id = auth.uid() OR public.is_admin_or_super());

DROP POLICY IF EXISTS "complaints_insert" ON public.complaints;
CREATE POLICY "complaints_insert" ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (complainant_id = auth.uid());

DROP POLICY IF EXISTS "complaints_admin_update" ON public.complaints;
CREATE POLICY "complaints_admin_update" ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- 5.22 audit_logs
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super());

-- 5.23 notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ============================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(state, district);

-- provider profiles
CREATE INDEX IF NOT EXISTS idx_farmer_location ON public.farmer_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_farmer_verified ON public.farmer_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_labour_location ON public.labour_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_labour_available ON public.labour_profiles(is_available, is_verified);

CREATE INDEX IF NOT EXISTS idx_tractor_location ON public.tractor_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_tractor_available ON public.tractor_profiles(is_available, is_verified);

CREATE INDEX IF NOT EXISTS idx_transport_location ON public.transport_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_transport_available ON public.transport_profiles(is_available, is_verified);

-- marketplace listings & offers
CREATE INDEX IF NOT EXISTS idx_produce_listings_active ON public.produce_listings(is_active, crop);
CREATE INDEX IF NOT EXISTS idx_produce_listings_farmer ON public.produce_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_offers_listing ON public.produce_offers(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_produce_offers_buyer ON public.produce_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_produce_offers_farmer ON public.produce_offers(farmer_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON public.orders(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);

-- bookings
CREATE INDEX IF NOT EXISTS idx_work_requests_farmer ON public.work_requests(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_work_requests_labour ON public.work_requests(labour_id, status, work_date);
CREATE INDEX IF NOT EXISTS idx_tractor_bookings_farmer ON public.tractor_bookings(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_tractor_bookings_owner ON public.tractor_bookings(tractor_owner_id, status, booking_date);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_farmer ON public.transport_bookings(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_provider ON public.transport_bookings(transport_provider_id, status, booking_date);

-- payments
CREATE INDEX IF NOT EXISTS idx_offline_payments_receipt ON public.offline_payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_offline_payments_payer ON public.offline_payments(payer_id, status);
CREATE INDEX IF NOT EXISTS idx_offline_payments_payee ON public.offline_payments(payee_id, status);
CREATE INDEX IF NOT EXISTS idx_offline_payments_agent ON public.offline_payments(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_partial_payments_payment ON public.payment_partial_records(payment_id);
CREATE INDEX IF NOT EXISTS idx_cashbook_entries_cashbook ON public.agent_cashbook_entries(cashbook_id);
CREATE INDEX IF NOT EXISTS idx_commissions_agent ON public.agent_commissions(agent_id, status);

-- notifications & audit
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_complaints_complainant ON public.complaints(complainant_id, status);
