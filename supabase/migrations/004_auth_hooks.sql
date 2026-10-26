-- ============================================================
-- Shetkari Sathi — Migration 004: Auth Hooks & User Setup Trigger
-- Date: 2026-10-22
-- Description: Automatically initializes a profile in public.profiles
--              whenever a new user signs up via Supabase Auth.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_raw_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_lang TEXT;
BEGIN
  -- Extract raw role passed in user metadata (default to FARMER if missing or invalid)
  v_raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER');
  
  -- Prevent normal self-registration as privileged roles (ADMIN, SUPER_ADMIN)
  IF v_raw_role IN ('ADMIN', 'SUPER_ADMIN') THEN
    v_role := 'FARMER'::user_role;
  ELSE
    BEGIN
      v_role := v_raw_role::user_role;
    EXCEPTION WHEN OTHERS THEN
      v_role := 'FARMER'::user_role;
    END;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New User');
  v_phone     := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone);
  v_lang      := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    account_status,
    preferred_language,
    phone,
    is_active
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_role,
    'PENDING', -- All new registrations require admin approval or verification
    v_lang,
    v_phone,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    preferred_language = EXCLUDED.preferred_language;

  -- Create sub-profile shell depending on role
  IF v_role = 'FARMER' THEN
    INSERT INTO public.farmer_profiles (user_id, mobile, state, district, taluka, village, address)
    VALUES (NEW.id, COALESCE(v_phone, ''), '', '', '', '', '')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'LABOUR' THEN
    INSERT INTO public.labour_profiles (user_id, mobile, daily_wage, state, district, taluka, village, address)
    VALUES (NEW.id, COALESCE(v_phone, ''), 500.00, '', '', '', '', '')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'TRACTOR_OWNER' THEN
    INSERT INTO public.tractor_profiles (user_id, mobile, tractor_type, model, rate_per_hour, state, district, taluka, village, address)
    VALUES (NEW.id, COALESCE(v_phone, ''), 'Tractor', 'Standard', 800.00, '', '', '', '', '')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF v_role = 'TRANSPORT_PROVIDER' THEN
    INSERT INTO public.transport_profiles (user_id, mobile, vehicle_type, vehicle_number, capacity, capacity_unit, rate_per_km, state, district, taluka, village, address)
    VALUES (NEW.id, COALESCE(v_phone, ''), 'Truck', 'MH-00-TEMP', 1.0, 'TON', 25.00, '', '', '', '', '')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
