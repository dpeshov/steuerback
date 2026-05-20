-- ============================================================
-- SteuerBack — Demo Seed Data
-- Run this in Supabase SQL Editor to populate test data
-- ============================================================

DO $$
DECLARE
  -- Fake user IDs
  v_ana_id      uuid := gen_random_uuid();
  v_marko_id    uuid := gen_random_uuid();
  v_stefan_id   uuid := gen_random_uuid();
  v_katarina_id uuid := gen_random_uuid();

  -- App IDs
  v_daniel_id   uuid;
  v_daniel_app  uuid;
  v_ana_app     uuid;
  v_marko_app   uuid;
  v_stefan_app  uuid;
  v_katarina_app uuid;

BEGIN

-- ============================================================
-- 0. GET DANIEL'S EXISTING USER + APP
-- ============================================================
SELECT id INTO v_daniel_id FROM public.users WHERE email = 'daniel@posrednik.mk';
SELECT id INTO v_daniel_app FROM public.applications WHERE user_id = v_daniel_id ORDER BY created_at DESC LIMIT 1;

-- If no app yet, create one
IF v_daniel_app IS NULL THEN
  INSERT INTO public.applications (user_id, tax_year, status)
  VALUES (v_daniel_id, 2023, 'in_review')
  RETURNING id INTO v_daniel_app;
ELSE
  UPDATE public.applications SET status = 'in_review', updated_at = NOW() WHERE id = v_daniel_app;
END IF;

-- ============================================================
-- 1. FULLY FILL DANIEL'S PROFILE
-- ============================================================
UPDATE public.profiles SET
  first_name           = 'Daniel',
  last_name            = 'Peshov',
  date_of_birth        = '1995-03-15',
  nationality          = 'Macedonian',
  phone                = '+389 70 123 456',
  country_of_residence = 'North Macedonia',
  city                 = 'Skopje',
  address              = 'Ul. Makedonija 15',
  passport_number      = 'M1234567',
  document_type        = 'passport',
  issuing_country      = 'North Macedonia',
  document_expiry      = '2028-06-20',
  employer_name        = 'Amazon Deutschland GmbH',
  work_start           = '2023-03-01',
  work_end             = '2023-10-31',
  gross_income_eur     = 18500,
  bank_name            = 'Stopanska Banka',
  iban                 = 'MK07 2501 2000 0003 456',
  swift_bic            = 'STBKMK2X',
  bank_account_holder  = 'Daniel Peshov',
  bank_country         = 'North Macedonia',
  profile_complete     = true,
  updated_at           = NOW()
WHERE user_id = v_daniel_id;

-- ============================================================
-- 2. DANIEL'S STATUS LOG (full timeline)
-- ============================================================
DELETE FROM public.status_logs WHERE application_id = v_daniel_app;
INSERT INTO public.status_logs (application_id, old_status, new_status, reason, created_at) VALUES
  (v_daniel_app, NULL,                 'draft',               'Application started',                         NOW() - INTERVAL '14 days'),
  (v_daniel_app, 'draft',              'profile_incomplete',  'Profile fields missing',                      NOW() - INTERVAL '13 days'),
  (v_daniel_app, 'profile_incomplete', 'documents_pending',   'Profile completed successfully',               NOW() - INTERVAL '10 days'),
  (v_daniel_app, 'documents_pending',  'ready_for_payment',   'All required documents received',             NOW() - INTERVAL '7 days'),
  (v_daniel_app, 'ready_for_payment',  'paid',                'Payment confirmed — €70 upfront via Stripe',  NOW() - INTERVAL '5 days'),
  (v_daniel_app, 'paid',               'in_review',           'Documents forwarded to tax specialist',       NOW() - INTERVAL '3 days');

-- ============================================================
-- 3. DANIEL'S DOCUMENTS (mix of statuses for review)
-- ============================================================
DELETE FROM public.documents WHERE application_id = v_daniel_app;
INSERT INTO public.documents (application_id, document_type, file_path, file_name, file_size, mime_type, review_status, admin_note, created_at) VALUES
  (v_daniel_app, 'passport',          v_daniel_id || '/' || v_daniel_app || '/passport/passport_daniel.pdf',             'passport_daniel_peshov.pdf',      1240000, 'application/pdf', 'pending',        NULL,                                                  NOW() - INTERVAL '10 days'),
  (v_daniel_app, 'lohnsteuer',        v_daniel_id || '/' || v_daniel_app || '/lohnsteuer/lohnsteuer_2023.pdf',           'lohnsteuer_2023_amazon.pdf',      890000,  'application/pdf', 'pending',        NULL,                                                  NOW() - INTERVAL '10 days'),
  (v_daniel_app, 'payslip',           v_daniel_id || '/' || v_daniel_app || '/payslip/payslips_2023.pdf',                'payslips_mar_oct_2023.pdf',       2100000, 'application/pdf', 'approved',       NULL,                                                  NOW() - INTERVAL '9 days'),
  (v_daniel_app, 'power_of_attorney', v_daniel_id || '/' || v_daniel_app || '/power_of_attorney/poa_signed.pdf',        'power_of_attorney_signed.pdf',    450000,  'application/pdf', 'approved',       NULL,                                                  NOW() - INTERVAL '8 days'),
  (v_daniel_app, 'bank_proof',        v_daniel_id || '/' || v_daniel_app || '/bank_proof/bank_statement.pdf',           'bank_statement_2024.pdf',         320000,  'application/pdf', 'needs_reupload', 'IBAN number not clearly visible. Please reupload.',   NOW() - INTERVAL '7 days');

-- ============================================================
-- 4. DANIEL'S NOTES
-- ============================================================
DELETE FROM public.notes WHERE application_id = v_daniel_app;
INSERT INTO public.notes (application_id, text, created_by, is_public, created_at) VALUES
  (v_daniel_app, 'Application received. Payment confirmed. Documents sent for specialist review.',           v_daniel_id, true,  NOW() - INTERVAL '3 days'),
  (v_daniel_app, 'Bank proof document flagged — IBAN not visible. Client notified to reupload.',            v_daniel_id, true,  NOW() - INTERVAL '2 days'),
  (v_daniel_app, 'Internal: Employer Amazon GmbH verified against Lohnsteuer. Tax class 1. Looks clean.',   v_daniel_id, false, NOW() - INTERVAL '1 day');


-- ============================================================
-- 5. CREATE FAKE AUTH USERS (trigger auto-creates public.users + profiles)
-- ============================================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, aud, role,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  (v_ana_id,      '00000000-0000-0000-0000-000000000000', 'ana.popovic@test.com',    crypt('TestPass123!', gen_salt('bf')), NOW() - INTERVAL '20 days', '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '20 days', NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  (v_marko_id,    '00000000-0000-0000-0000-000000000000', 'marko.j@test.com',        crypt('TestPass123!', gen_salt('bf')), NOW() - INTERVAL '35 days', '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '35 days', NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  (v_stefan_id,   '00000000-0000-0000-0000-000000000000', 'stefan.petrov@test.com',  crypt('TestPass123!', gen_salt('bf')), NOW() - INTERVAL '60 days', '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '60 days', NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  (v_katarina_id, '00000000-0000-0000-0000-000000000000', 'katarina.kovac@test.com', crypt('TestPass123!', gen_salt('bf')), NOW() - INTERVAL '12 days', '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '12 days', NOW(), 'authenticated', 'authenticated', '', '', '', '');


-- ============================================================
-- 6. FILL FAKE PROFILES
-- ============================================================
UPDATE public.profiles SET
  first_name='Ana', last_name='Popovic', date_of_birth='1997-07-22',
  nationality='Serbian', phone='+381 63 456 789',
  country_of_residence='Serbia', city='Belgrade', address='Knez Mihailova 8',
  passport_number='SRB887766', document_type='passport', issuing_country='Serbia', document_expiry='2027-04-10',
  employer_name='DHL Paket GmbH', work_start='2023-05-01', work_end='2023-09-30', gross_income_eur=14200,
  bank_name='Banca Intesa Serbia', iban='RS35 1050 0000 1234 5678 90', swift_bic='DBDBRSBG',
  bank_account_holder='Ana Popovic', bank_country='Serbia',
  profile_complete=true, updated_at=NOW()
WHERE user_id = v_ana_id;

UPDATE public.profiles SET
  first_name='Marko', last_name='Jovanovic', date_of_birth='1993-11-08',
  nationality='Bosnian', phone='+387 61 234 567',
  country_of_residence='Bosnia', city='Sarajevo', address='Ferhadija 22',
  passport_number='BIH334455', document_type='passport', issuing_country='Bosnia', document_expiry='2026-09-15',
  employer_name='Lidl Deutschland GmbH & Co. KG', work_start='2022-06-15', work_end='2022-12-31', gross_income_eur=22100,
  bank_name='UniCredit Bank Sarajevo', iban='BA39 1291 0022 0123 4567', swift_bic='UNCRBA22',
  bank_account_holder='Marko Jovanovic', bank_country='Bosnia',
  profile_complete=true, updated_at=NOW()
WHERE user_id = v_marko_id;

UPDATE public.profiles SET
  first_name='Stefan', last_name='Petrov', date_of_birth='1990-02-14',
  nationality='Bulgarian', phone='+359 88 765 432',
  country_of_residence='Bulgaria', city='Sofia', address='Vitosha Blvd 42',
  passport_number='BG556677', document_type='passport', issuing_country='Bulgaria', document_expiry='2025-12-31',
  employer_name='BMW Group Munich', work_start='2021-01-15', work_end='2021-12-15', gross_income_eur=31400,
  bank_name='UniCredit Bulbank', iban='BG80 BNBG 9661 1020 3456 78', swift_bic='UNCRBGSF',
  bank_account_holder='Stefan Petrov', bank_country='Bulgaria',
  profile_complete=true, updated_at=NOW()
WHERE user_id = v_stefan_id;

UPDATE public.profiles SET
  first_name='Katarina', last_name='Kovac', date_of_birth='1999-05-30',
  nationality='Croatian', phone='+385 91 876 543',
  country_of_residence='Croatia', city='Zagreb', address='Ilica 100',
  passport_number='HR112233', document_type='passport', issuing_country='Croatia', document_expiry='2029-03-20',
  employer_name='Rewe Group Cologne', work_start='2023-06-01', work_end='2023-08-31', gross_income_eur=9800,
  student_status=true, university='University of Zagreb',
  bank_name='Zagrebacka Banka', iban='HR12 2360 0001 1012 3456 5', swift_bic='ZABAHR2X',
  bank_account_holder='Katarina Kovac', bank_country='Croatia',
  profile_complete=true, updated_at=NOW()
WHERE user_id = v_katarina_id;


-- ============================================================
-- 7. CREATE APPLICATIONS
-- ============================================================
INSERT INTO public.applications (id, user_id, tax_year, status, payment_status, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_ana_id,      2023, 'in_review',         'paid',   NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days')
RETURNING id INTO v_ana_app;

INSERT INTO public.applications (id, user_id, tax_year, status, payment_status, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_marko_id,    2022, 'documents_pending', 'unpaid', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day')
RETURNING id INTO v_marko_app;

INSERT INTO public.applications (id, user_id, tax_year, status, payment_status, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_stefan_id,   2021, 'completed',         'paid',   NOW() - INTERVAL '55 days', NOW() - INTERVAL '5 days')
RETURNING id INTO v_stefan_app;

INSERT INTO public.applications (id, user_id, tax_year, status, payment_status, created_at, updated_at)
VALUES
  (gen_random_uuid(), v_katarina_id, 2023, 'missing_documents', 'unpaid', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days')
RETURNING id INTO v_katarina_app;


-- ============================================================
-- 8. STATUS LOGS FOR ALL FAKE USERS
-- ============================================================

-- Ana — in_review
INSERT INTO public.status_logs (application_id, old_status, new_status, reason, created_at) VALUES
  (v_ana_app, NULL,                 'draft',              'Account created',                          NOW() - INTERVAL '18 days'),
  (v_ana_app, 'draft',              'documents_pending',  'Profile completed',                        NOW() - INTERVAL '16 days'),
  (v_ana_app, 'documents_pending',  'ready_for_payment',  'All documents uploaded and verified',      NOW() - INTERVAL '12 days'),
  (v_ana_app, 'ready_for_payment',  'paid',               'Payment €70 received via Stripe',          NOW() - INTERVAL '10 days'),
  (v_ana_app, 'paid',               'in_review',          'Handed over to tax team',                  NOW() - INTERVAL '2 days');

-- Marko — documents_pending
INSERT INTO public.status_logs (application_id, old_status, new_status, reason, created_at) VALUES
  (v_marko_app, NULL,    'draft',              'Account created',          NOW() - INTERVAL '30 days'),
  (v_marko_app, 'draft', 'documents_pending',  'Profile filled in',        NOW() - INTERVAL '25 days');

-- Stefan — completed
INSERT INTO public.status_logs (application_id, old_status, new_status, reason, created_at) VALUES
  (v_stefan_app, NULL,                    'draft',                 'Account created',                       NOW() - INTERVAL '55 days'),
  (v_stefan_app, 'draft',                 'documents_pending',     'Profile completed',                     NOW() - INTERVAL '52 days'),
  (v_stefan_app, 'documents_pending',     'ready_for_payment',     'All documents received and verified',   NOW() - INTERVAL '48 days'),
  (v_stefan_app, 'ready_for_payment',     'paid',                  'Payment €150 (deferred) confirmed',     NOW() - INTERVAL '45 days'),
  (v_stefan_app, 'paid',                  'in_review',             'Tax specialist assigned',               NOW() - INTERVAL '40 days'),
  (v_stefan_app, 'in_review',             'ready_for_submission',  'All documents approved, form prepared', NOW() - INTERVAL '20 days'),
  (v_stefan_app, 'ready_for_submission',  'submitted',             'Filed with Finanzamt München',          NOW() - INTERVAL '15 days'),
  (v_stefan_app, 'submitted',             'completed',             'Refund €1,847 transferred to client',  NOW() - INTERVAL '5 days');

-- Katarina — missing_documents
INSERT INTO public.status_logs (application_id, old_status, new_status, reason, created_at) VALUES
  (v_katarina_app, NULL,                'draft',              'Account created',                              NOW() - INTERVAL '10 days'),
  (v_katarina_app, 'draft',             'documents_pending',  'Profile completed',                            NOW() - INTERVAL '8 days'),
  (v_katarina_app, 'documents_pending', 'missing_documents',  'Lohnsteuer certificate missing or unreadable', NOW() - INTERVAL '3 days');


-- ============================================================
-- 9. DOCUMENTS FOR ALL FAKE USERS
-- ============================================================

-- Ana (in_review — all pending or approved, some pending for you to review)
INSERT INTO public.documents (application_id, document_type, file_path, file_name, file_size, mime_type, review_status, admin_note, created_at) VALUES
  (v_ana_app, 'passport',          v_ana_id || '/' || v_ana_app || '/passport/passport_ana.pdf',             'passport_ana_popovic.pdf',        980000,  'application/pdf', 'approved', NULL,                                                      NOW() - INTERVAL '16 days'),
  (v_ana_app, 'lohnsteuer',        v_ana_id || '/' || v_ana_app || '/lohnsteuer/lohnsteuer_2023.pdf',        'lohnsteuer_2023_dhl.pdf',         760000,  'application/pdf', 'pending',  NULL,                                                      NOW() - INTERVAL '15 days'),
  (v_ana_app, 'payslip',           v_ana_id || '/' || v_ana_app || '/payslip/payslips_may_sep.pdf',          'payslips_may_sep_2023.pdf',       1800000, 'application/pdf', 'pending',  NULL,                                                      NOW() - INTERVAL '15 days'),
  (v_ana_app, 'power_of_attorney', v_ana_id || '/' || v_ana_app || '/power_of_attorney/poa.pdf',             'power_of_attorney_ana.pdf',       420000,  'application/pdf', 'approved', NULL,                                                      NOW() - INTERVAL '14 days'),
  (v_ana_app, 'work_contract',     v_ana_id || '/' || v_ana_app || '/work_contract/contract_dhl.pdf',        'work_contract_dhl_2023.pdf',      550000,  'application/pdf', 'pending',  NULL,                                                      NOW() - INTERVAL '14 days');

-- Marko (documents_pending — only some uploaded)
INSERT INTO public.documents (application_id, document_type, file_path, file_name, file_size, mime_type, review_status, admin_note, created_at) VALUES
  (v_marko_app, 'lohnsteuer', v_marko_id || '/' || v_marko_app || '/lohnsteuer/lohnsteuer_2022.pdf', 'lohnsteuer_2022_lidl.pdf', 820000, 'application/pdf', 'pending', NULL, NOW() - INTERVAL '24 days'),
  (v_marko_app, 'passport',   v_marko_id || '/' || v_marko_app || '/passport/passport_marko.pdf',   'passport_marko_j.pdf',    1100000, 'application/pdf', 'approved', NULL, NOW() - INTERVAL '23 days');

-- Stefan (completed — all approved)
INSERT INTO public.documents (application_id, document_type, file_path, file_name, file_size, mime_type, review_status, admin_note, created_at) VALUES
  (v_stefan_app, 'passport',          v_stefan_id || '/' || v_stefan_app || '/passport/passport_stefan.pdf',          'passport_stefan_petrov.pdf',  1050000, 'application/pdf', 'approved', NULL, NOW() - INTERVAL '50 days'),
  (v_stefan_app, 'lohnsteuer',        v_stefan_id || '/' || v_stefan_app || '/lohnsteuer/lohnsteuer_2021.pdf',        'lohnsteuer_2021_bmw.pdf',     940000,  'application/pdf', 'approved', NULL, NOW() - INTERVAL '50 days'),
  (v_stefan_app, 'payslip',           v_stefan_id || '/' || v_stefan_app || '/payslip/payslips_2021.pdf',             'payslips_jan_dec_2021.pdf',   3200000, 'application/pdf', 'approved', NULL, NOW() - INTERVAL '49 days'),
  (v_stefan_app, 'power_of_attorney', v_stefan_id || '/' || v_stefan_app || '/power_of_attorney/poa_stefan.pdf',      'power_of_attorney_stefan.pdf', 410000, 'application/pdf', 'approved', NULL, NOW() - INTERVAL '48 days'),
  (v_stefan_app, 'bank_proof',        v_stefan_id || '/' || v_stefan_app || '/bank_proof/bank_statement_stefan.pdf',  'bank_statement_sofia.pdf',    280000,  'application/pdf', 'approved', NULL, NOW() - INTERVAL '47 days'),
  (v_stefan_app, 'work_contract',     v_stefan_id || '/' || v_stefan_app || '/work_contract/bmw_contract.pdf',        'bmw_contract_2021.pdf',       620000,  'application/pdf', 'approved', NULL, NOW() - INTERVAL '47 days');

-- Katarina (missing_documents — lohnsteuer rejected, passport pending)
INSERT INTO public.documents (application_id, document_type, file_path, file_name, file_size, mime_type, review_status, admin_note, created_at) VALUES
  (v_katarina_app, 'lohnsteuer', v_katarina_id || '/' || v_katarina_app || '/lohnsteuer/lohnsteuer_bad.pdf',  'lohnsteuer_2023_rewe.pdf',  180000, 'application/pdf', 'rejected', 'Document is unreadable — photo too dark. Please upload a clear scan of the original.',  NOW() - INTERVAL '7 days'),
  (v_katarina_app, 'passport',   v_katarina_id || '/' || v_katarina_app || '/passport/passport_katarina.pdf', 'passport_katarina_k.pdf',  990000, 'application/pdf', 'pending',  NULL,                                                                                          NOW() - INTERVAL '8 days'),
  (v_katarina_app, 'student_proof', v_katarina_id || '/' || v_katarina_app || '/student_proof/enrollment.pdf', 'uni_zagreb_enrollment.pdf', 350000, 'application/pdf', 'pending', NULL,                                                                                         NOW() - INTERVAL '7 days');


-- ============================================================
-- 10. NOTES FOR ALL FAKE USERS
-- ============================================================

-- Ana
INSERT INTO public.notes (application_id, text, created_by, is_public, created_at) VALUES
  (v_ana_app, 'Welcome Ana! Your application is under review. We will update you within 3–5 business days.', v_ana_id, true,  NOW() - INTERVAL '2 days'),
  (v_ana_app, 'Internal: DHL seasonal contract. Tax class 1. Straightforward case, estimated refund €620–€850.', v_ana_id, false, NOW() - INTERVAL '1 day');

-- Marko
INSERT INTO public.notes (application_id, text, created_by, is_public, created_at) VALUES
  (v_marko_app, 'Hi Marko — please upload your payslips and power of attorney to complete your application.', v_marko_id, true, NOW() - INTERVAL '20 days');

-- Stefan
INSERT INTO public.notes (application_id, text, created_by, is_public, created_at) VALUES
  (v_stefan_app, 'All documents verified and approved. Tax return prepared and submitted to Finanzamt München.', v_stefan_id, true, NOW() - INTERVAL '15 days'),
  (v_stefan_app, 'Great news Stefan — refund of €1,847 has been transferred to your Bulgarian bank account!', v_stefan_id, true, NOW() - INTERVAL '5 days'),
  (v_stefan_app, 'Internal: Highest refund this month. BMW tax class 4→1 correction was the main driver.', v_stefan_id, false, NOW() - INTERVAL '5 days');

-- Katarina
INSERT INTO public.notes (application_id, text, created_by, is_public, created_at) VALUES
  (v_katarina_app, 'Katarina, your Lohnsteuerbescheinigung could not be read. Please upload a clear scan. See the document note for details.', v_katarina_id, true, NOW() - INTERVAL '3 days');


RAISE NOTICE 'Seed complete. Users: ana.popovic@test.com, marko.j@test.com, stefan.petrov@test.com, katarina.kovac@test.com — all password: TestPass123!';

END $$;
