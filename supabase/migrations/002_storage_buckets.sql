-- ============================================================
-- Shetkari Sathi — Migration 002: Storage Buckets & Policies
-- Date: 2026-10-22
-- Description: Provision storage buckets and secure access policies
-- ============================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('produce-photos', 'produce-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-photos', 'profile-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('payment-evidence', 'payment-evidence', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('delivery-proof', 'delivery-proof', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies

-- 2.1 Produce Photos (Public View, Authenticated Upload)
DROP POLICY IF EXISTS "produce_photos_public_select" ON storage.objects;
CREATE POLICY "produce_photos_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'produce-photos');

DROP POLICY IF EXISTS "produce_photos_auth_insert" ON storage.objects;
CREATE POLICY "produce_photos_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produce-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "produce_photos_auth_delete" ON storage.objects;
CREATE POLICY "produce_photos_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produce-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2.2 Profile Photos (Public View, Owner Upload/Delete)
DROP POLICY IF EXISTS "profile_photos_public_select" ON storage.objects;
CREATE POLICY "profile_photos_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "profile_photos_owner_insert" ON storage.objects;
CREATE POLICY "profile_photos_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "profile_photos_owner_delete" ON storage.objects;
CREATE POLICY "profile_photos_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2.3 User Documents (Private: Owner & Admin only)
DROP POLICY IF EXISTS "documents_owner_admin_select" ON storage.objects;
CREATE POLICY "documents_owner_admin_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin_or_super()
    )
  );

DROP POLICY IF EXISTS "documents_owner_insert" ON storage.objects;
CREATE POLICY "documents_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2.4 Payment Evidence (Private: Agent, Parties & Admin)
DROP POLICY IF EXISTS "payment_evidence_select" ON storage.objects;
CREATE POLICY "payment_evidence_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-evidence' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin_or_super()
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'AUTHORIZED_PAYMENT_AGENT'
    )
  );

DROP POLICY IF EXISTS "payment_evidence_insert" ON storage.objects;
CREATE POLICY "payment_evidence_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-evidence');

-- 2.5 Delivery Proof (Private: Transporter, Parties & Admin)
DROP POLICY IF EXISTS "delivery_proof_select" ON storage.objects;
CREATE POLICY "delivery_proof_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'delivery-proof' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin_or_super()
    )
  );

DROP POLICY IF EXISTS "delivery_proof_insert" ON storage.objects;
CREATE POLICY "delivery_proof_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'delivery-proof' AND auth.uid()::text = (storage.foldername(name))[1]);
