-- ============================================================
-- SteuerBack — Dummy Seed Data (20 users + applications)
-- Paste this entire script into Supabase SQL Editor and run it.
-- Password for ALL dummy users: Test1234!
-- ============================================================

-- Step 1: Insert 20 dummy users into auth.users
-- The trigger (handle_new_user) will auto-create public.users + public.profiles

INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token
) VALUES
  ('11111111-0001-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marko.petrovic@gmail.com',   crypt('Test1234!', gen_salt('bf')), now(), now() - interval '30 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0002-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.kovacevic@gmail.com',     crypt('Test1234!', gen_salt('bf')), now(), now() - interval '28 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0003-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stefan.jovanovic@yahoo.com',  crypt('Test1234!', gen_salt('bf')), now(), now() - interval '25 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0004-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'milena.todorov@gmail.com',    crypt('Test1234!', gen_salt('bf')), now(), now() - interval '22 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0005-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ivan.georgi@gmail.com',       crypt('Test1234!', gen_salt('bf')), now(), now() - interval '20 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0006-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nikola.dimitrov@yahoo.com',   crypt('Test1234!', gen_salt('bf')), now(), now() - interval '18 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0007-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sara.hadzic@gmail.com',       crypt('Test1234!', gen_salt('bf')), now(), now() - interval '17 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0008-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dragan.popov@gmail.com',      crypt('Test1234!', gen_salt('bf')), now(), now() - interval '15 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0009-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elena.vasic@gmail.com',       crypt('Test1234!', gen_salt('bf')), now(), now() - interval '14 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0010-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aleksandar.novak@gmail.com',  crypt('Test1234!', gen_salt('bf')), now(), now() - interval '13 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0011-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marta.kowalska@gmail.com',    crypt('Test1234!', gen_salt('bf')), now(), now() - interval '12 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0012-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'david.moldovan@yahoo.com',    crypt('Test1234!', gen_salt('bf')), now(), now() - interval '11 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0013-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cristina.popa@gmail.com',     crypt('Test1234!', gen_salt('bf')), now(), now() - interval '10 days', now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0014-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'artan.berisha@gmail.com',     crypt('Test1234!', gen_salt('bf')), now(), now() - interval '9 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0015-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'blerim.kelmendi@gmail.com',   crypt('Test1234!', gen_salt('bf')), now(), now() - interval '8 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0016-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mihail.ionescu@gmail.com',    crypt('Test1234!', gen_salt('bf')), now(), now() - interval '7 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0017-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'valentina.stojanov@gmail.com',crypt('Test1234!', gen_salt('bf')), now(), now() - interval '6 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0018-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh.kumar@gmail.com',      crypt('Test1234!', gen_salt('bf')), now(), now() - interval '5 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0019-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.sharma@gmail.com',      crypt('Test1234!', gen_salt('bf')), now(), now() - interval '4 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', ''),
  ('11111111-0020-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ozgur.yilmaz@gmail.com',      crypt('Test1234!', gen_salt('bf')), now(), now() - interval '3 days',  now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Step 2: Update profiles with realistic dummy data
-- (trigger already created the empty profile rows)
-- ============================================================

UPDATE public.profiles SET
  first_name='Marko', last_name='Petrovic', date_of_birth='1995-03-12',
  nationality='Serbia', phone='+381 63 123 456', country_of_residence='Serbia',
  city='Belgrade', address='Knez Mihailova 10', document_type='passport',
  passport_number='SB123456', issuing_country='Serbia', document_expiry='2028-03-12',
  employer_name='DHL Deutschland GmbH', work_start='2023-04-01', work_end='2023-10-31',
  gross_income_eur=18500, bank_account_holder='Marko Petrovic',
  iban='RS35105008123123456789', swift_bic='RZBSRSBG', bank_name='Raiffeisen Bank', bank_country='Serbia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0001-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Ana', last_name='Kovacevic', date_of_birth='1998-07-22',
  nationality='Croatia', phone='+385 91 234 567', country_of_residence='Croatia',
  city='Zagreb', address='Ilica 45', document_type='national_id',
  passport_number='HR987654', issuing_country='Croatia', document_expiry='2027-07-22',
  employer_name='Amazon Logistics GmbH', work_start='2023-06-01', work_end='2023-09-30',
  gross_income_eur=12800, bank_account_holder='Ana Kovacevic',
  iban='HR1210010051863000160', swift_bic='PBZGHR2X', bank_name='PBZ Bank', bank_country='Croatia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0002-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Stefan', last_name='Jovanovic', date_of_birth='1993-11-05',
  nationality='Serbia', phone='+381 64 345 678', country_of_residence='Serbia',
  city='Novi Sad', address='Zmaj Jovina 3', document_type='passport',
  passport_number='SB445566', issuing_country='Serbia', document_expiry='2026-11-05',
  employer_name='BMW Group München', work_start='2022-01-15', work_end='2022-12-20',
  gross_income_eur=32000, bank_account_holder='Stefan Jovanovic',
  iban='RS35105008123987654321', swift_bic='KOBSRSBG', bank_name='Komercijalna Banka', bank_country='Serbia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0003-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Milena', last_name='Todorov', date_of_birth='1997-02-28',
  nationality='Bulgaria', phone='+359 88 456 789', country_of_residence='Bulgaria',
  city='Sofia', address='Vitosha Blvd 22', document_type='passport',
  passport_number='BG778899', issuing_country='Bulgaria', document_expiry='2029-02-28',
  employer_name='LIDL Stiftung Germany', work_start='2023-03-01', work_end='2023-08-31',
  gross_income_eur=14200, bank_account_holder='Milena Todorov',
  iban='BG80BNBG96611020345678', swift_bic='UNCRBGSF', bank_name='UniCredit Bulbank', bank_country='Bulgaria',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0004-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Ivan', last_name='Georgi', date_of_birth='1990-09-14',
  nationality='Bulgaria', phone='+359 87 567 890', country_of_residence='Bulgaria',
  city='Plovdiv', address='Main Street 7', document_type='national_id',
  passport_number='BG112233', issuing_country='Bulgaria', document_expiry='2025-09-14',
  employer_name='Volkswagen AG Wolfsburg', work_start='2021-05-01', work_end='2021-12-31',
  gross_income_eur=28500, bank_account_holder='Ivan Georgi',
  iban='BG80BNBG96611020999888', swift_bic='UNCRBGSF', bank_name='UniCredit Bulbank', bank_country='Bulgaria',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0005-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Nikola', last_name='Dimitrov', date_of_birth='1996-05-18',
  nationality='North Macedonia', phone='+389 70 123 456', country_of_residence='North Macedonia',
  city='Skopje', address='Makedonija 15', document_type='passport',
  passport_number='MK334455', issuing_country='North Macedonia', document_expiry='2027-05-18',
  employer_name='Edeka Gruppe Hamburg', work_start='2023-07-01', work_end='2023-11-30',
  gross_income_eur=11600, bank_account_holder='Nikola Dimitrov',
  iban='MK07300000000042425', swift_bic='STBKMK2X', bank_name='Stopanska Banka', bank_country='North Macedonia',
  profile_complete=false, updated_at=now()
WHERE user_id='11111111-0006-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Sara', last_name='Hadzic', date_of_birth='1999-12-03',
  nationality='Bosnia', phone='+387 61 234 567', country_of_residence='Bosnia',
  city='Sarajevo', address='Ferhadija 8', document_type='passport',
  passport_number='BA556677', issuing_country='Bosnia', document_expiry='2028-12-03',
  student_status=true, university='University of Sarajevo',
  employer_name='Rewe Group Köln', work_start='2023-06-15', work_end='2023-08-31',
  gross_income_eur=8400, bank_account_holder='Sara Hadzic',
  iban='BA391290079401028494', swift_bic='UNCRBA22', bank_name='UniCredit Mostar', bank_country='Bosnia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0007-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Dragan', last_name='Popov', date_of_birth='1988-04-25',
  nationality='Serbia', phone='+381 65 678 901', country_of_residence='Serbia',
  city='Nis', address='Obrenoviceva 20', document_type='passport',
  passport_number='SB667788', issuing_country='Serbia', document_expiry='2026-04-25',
  employer_name='Bosch GmbH Stuttgart', work_start='2022-03-01', work_end='2022-11-30',
  gross_income_eur=24000, bank_account_holder='Dragan Popov',
  iban='RS35105008123111222333', swift_bic='RZBSRSBG', bank_name='Raiffeisen Bank', bank_country='Serbia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0008-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Elena', last_name='Vasic', date_of_birth='1994-08-09',
  nationality='Serbia', phone='+381 66 789 012', country_of_residence='Serbia',
  city='Kragujevac', address='Svetozara Markovica 5', document_type='national_id',
  passport_number='SB889900', issuing_country='Serbia', document_expiry='2027-08-09',
  employer_name='Siemens AG Berlin', work_start='2023-02-01', work_end='2023-07-31',
  gross_income_eur=16800, bank_account_holder='Elena Vasic',
  iban='RS35105008123444555666', swift_bic='KOBSRSBG', bank_name='Komercijalna Banka', bank_country='Serbia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0009-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Aleksandar', last_name='Novak', date_of_birth='1992-01-30',
  nationality='Poland', phone='+48 500 123 456', country_of_residence='Poland',
  city='Warsaw', address='Nowy Swiat 44', document_type='passport',
  passport_number='PL223344', issuing_country='Poland', document_expiry='2027-01-30',
  employer_name='Mercedes-Benz AG', work_start='2022-09-01', work_end='2023-03-31',
  gross_income_eur=22500, bank_account_holder='Aleksandar Novak',
  iban='PL61109010140000071219812874', swift_bic='WBKPPLPP', bank_name='Santander Poland', bank_country='Poland',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0010-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Marta', last_name='Kowalska', date_of_birth='2000-06-17',
  nationality='Poland', phone='+48 600 234 567', country_of_residence='Poland',
  city='Krakow', address='Florianska 12', document_type='passport',
  passport_number='PL445566', issuing_country='Poland', document_expiry='2030-06-17',
  student_status=true, university='Jagiellonian University',
  employer_name='Aldi GmbH Germany', work_start='2023-07-01', work_end='2023-09-15',
  gross_income_eur=7800, bank_account_holder='Marta Kowalska',
  iban='PL61109010140000071219811111', swift_bic='PKOPPLPW', bank_name='PKO Bank', bank_country='Poland',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0011-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='David', last_name='Moldovan', date_of_birth='1991-03-21',
  nationality='Romania', phone='+40 721 345 678', country_of_residence='Romania',
  city='Bucharest', address='Calea Victoriei 30', document_type='passport',
  passport_number='RO334455', issuing_country='Romania', document_expiry='2026-03-21',
  employer_name='Porsche Leipzig', work_start='2021-10-01', work_end='2022-09-30',
  gross_income_eur=31000, bank_account_holder='David Moldovan',
  iban='RO49AAAA1B31007593840000', swift_bic='BRDEROBU', bank_name='BRD Romania', bank_country='Romania',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0012-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Cristina', last_name='Popa', date_of_birth='1997-11-11',
  nationality='Romania', phone='+40 722 456 789', country_of_residence='Romania',
  city='Cluj-Napoca', address='Eroilor 15', document_type='national_id',
  passport_number='RO556677', issuing_country='Romania', document_expiry='2028-11-11',
  employer_name='Kaufland Deutschland', work_start='2023-04-01', work_end='2023-09-30',
  gross_income_eur=13500, bank_account_holder='Cristina Popa',
  iban='RO49AAAA1B31007593840001', swift_bic='BTRLRO22', bank_name='Banca Transilvania', bank_country='Romania',
  profile_complete=false, updated_at=now()
WHERE user_id='11111111-0013-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Artan', last_name='Berisha', date_of_birth='1993-07-04',
  nationality='Albania', phone='+355 68 123 456', country_of_residence='Albania',
  city='Tirana', address='Rruga e Kavajes 22', document_type='passport',
  passport_number='AL778899', issuing_country='Albania', document_expiry='2027-07-04',
  employer_name='Continental AG Hannover', work_start='2022-06-01', work_end='2022-12-31',
  gross_income_eur=19800, bank_account_holder='Artan Berisha',
  iban='AL47212110090000000235698741', swift_bic='NCBAALTX', bank_name='NCB Albania', bank_country='Albania',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0014-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Blerim', last_name='Kelmendi', date_of_birth='1995-09-19',
  nationality='Kosovo', phone='+383 44 234 567', country_of_residence='Kosovo',
  city='Pristina', address='Nena Tereze 8', document_type='passport',
  passport_number='XK112233', issuing_country='Kosovo', document_expiry='2029-09-19',
  employer_name='Deutsche Post DHL', work_start='2023-05-01', work_end='2023-10-15',
  gross_income_eur=15600, bank_account_holder='Blerim Kelmendi',
  iban='XK051000000000000053', swift_bic='RBKOXKPR', bank_name='Raiffeisen Kosovo', bank_country='Kosovo',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0015-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Mihail', last_name='Ionescu', date_of_birth='1989-02-14',
  nationality='Romania', phone='+40 723 567 890', country_of_residence='Romania',
  city='Timisoara', address='Piata Victoriei 3', document_type='passport',
  passport_number='RO889900', issuing_country='Romania', document_expiry='2025-02-14',
  employer_name='Audi AG Ingolstadt', work_start='2021-01-15', work_end='2021-12-15',
  gross_income_eur=38500, bank_account_holder='Mihail Ionescu',
  iban='RO49AAAA1B31007593840002', swift_bic='BRDEROBU', bank_name='BRD Romania', bank_country='Romania',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0016-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Valentina', last_name='Stojanovic', date_of_birth='1996-10-08',
  nationality='Serbia', phone='+381 67 890 123', country_of_residence='Serbia',
  city='Subotica', address='Korzo 1', document_type='national_id',
  passport_number='SB990011', issuing_country='Serbia', document_expiry='2028-10-08',
  employer_name='Rossmann GmbH Hamburg', work_start='2023-03-15', work_end='2023-08-15',
  gross_income_eur=11200, bank_account_holder='Valentina Stojanovic',
  iban='RS35105008123777888999', swift_bic='RZBSRSBG', bank_name='Raiffeisen Bank', bank_country='Serbia',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0017-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Rajesh', last_name='Kumar', date_of_birth='1990-12-25',
  nationality='Other', phone='+91 98765 43210', country_of_residence='Other',
  city='Delhi', address='Connaught Place 5', document_type='passport',
  passport_number='IN445566', issuing_country='Other', document_expiry='2028-12-25',
  employer_name='SAP SE Walldorf', work_start='2022-04-01', work_end='2023-03-31',
  gross_income_eur=42000, bank_account_holder='Rajesh Kumar',
  iban='DE89370400440532013000', swift_bic='COBADEFFXXX', bank_name='Commerzbank', bank_country='Germany',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0018-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Priya', last_name='Sharma', date_of_birth='1994-04-02',
  nationality='Other', phone='+91 87654 32109', country_of_residence='Other',
  city='Mumbai', address='Bandra West 12', document_type='passport',
  passport_number='IN667788', issuing_country='Other', document_expiry='2029-04-02',
  student_status=true, university='Goethe University Frankfurt',
  employer_name='Bosch GmbH Stuttgart', work_start='2023-01-10', work_end='2023-06-30',
  gross_income_eur=9600, bank_account_holder='Priya Sharma',
  iban='DE89370400440532013001', swift_bic='DEUTDEDB', bank_name='Deutsche Bank', bank_country='Germany',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0019-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name='Ozgur', last_name='Yilmaz', date_of_birth='1992-06-30',
  nationality='Other', phone='+90 532 123 4567', country_of_residence='Other',
  city='Istanbul', address='Istiklal Caddesi 88', document_type='passport',
  passport_number='TR223344', issuing_country='Other', document_expiry='2027-06-30',
  employer_name='Telekom Deutschland', work_start='2022-08-01', work_end='2023-01-31',
  gross_income_eur=21000, bank_account_holder='Ozgur Yilmaz',
  iban='TR330006100519786457841326', swift_bic='ISBKTRIS', bank_name='Isbank', bank_country='Other',
  profile_complete=true, updated_at=now()
WHERE user_id='11111111-0020-0000-0000-000000000001';

-- ============================================================
-- Step 3: Create applications with varied statuses
-- ============================================================

INSERT INTO public.applications (user_id, tax_year, status, payment_status, created_at, updated_at, submitted_at, completed_at) VALUES
  ('11111111-0001-0000-0000-000000000001', 2023, 'submitted',         'paid',   now()-interval '28 days', now()-interval '2 days',  now()-interval '5 days', null),
  ('11111111-0002-0000-0000-000000000001', 2023, 'in_review',         'paid',   now()-interval '26 days', now()-interval '3 days',  null, null),
  ('11111111-0003-0000-0000-000000000001', 2022, 'completed',         'paid',   now()-interval '120 days', now()-interval '10 days', now()-interval '90 days', now()-interval '10 days'),
  ('11111111-0004-0000-0000-000000000001', 2023, 'in_review',         'paid',   now()-interval '20 days', now()-interval '4 days',  null, null),
  ('11111111-0005-0000-0000-000000000001', 2021, 'completed',         'paid',   now()-interval '200 days', now()-interval '30 days', now()-interval '150 days', now()-interval '30 days'),
  ('11111111-0006-0000-0000-000000000001', 2023, 'profile_incomplete','unpaid', now()-interval '18 days', now()-interval '18 days', null, null),
  ('11111111-0007-0000-0000-000000000001', 2023, 'documents_pending', 'unpaid', now()-interval '17 days', now()-interval '1 day',   null, null),
  ('11111111-0008-0000-0000-000000000001', 2022, 'ready_for_submission','paid', now()-interval '60 days', now()-interval '2 days',  null, null),
  ('11111111-0009-0000-0000-000000000001', 2023, 'in_review',         'paid',   now()-interval '14 days', now()-interval '1 day',   null, null),
  ('11111111-0010-0000-0000-000000000001', 2022, 'submitted',         'paid',   now()-interval '45 days', now()-interval '3 days',  now()-interval '10 days', null),
  ('11111111-0011-0000-0000-000000000001', 2023, 'documents_pending', 'unpaid', now()-interval '12 days', now()-interval '12 days', null, null),
  ('11111111-0012-0000-0000-000000000001', 2021, 'rejected',          'unpaid', now()-interval '180 days', now()-interval '60 days', null, null),
  ('11111111-0013-0000-0000-000000000001', 2023, 'draft',             'unpaid', now()-interval '10 days', now()-interval '10 days', null, null),
  ('11111111-0014-0000-0000-000000000001', 2022, 'paid',              'paid',   now()-interval '30 days', now()-interval '5 days',  null, null),
  ('11111111-0015-0000-0000-000000000001', 2023, 'ready_for_payment', 'unpaid', now()-interval '8 days',  now()-interval '8 days',  null, null),
  ('11111111-0016-0000-0000-000000000001', 2021, 'completed',         'paid',   now()-interval '365 days', now()-interval '90 days', now()-interval '300 days', now()-interval '90 days'),
  ('11111111-0017-0000-0000-000000000001', 2023, 'missing_documents', 'paid',   now()-interval '25 days', now()-interval '2 days',  null, null),
  ('11111111-0018-0000-0000-000000000001', 2022, 'paid',              'paid',   now()-interval '35 days', now()-interval '7 days',  null, null),
  ('11111111-0019-0000-0000-000000000001', 2023, 'profile_incomplete','unpaid', now()-interval '4 days',  now()-interval '4 days',  null, null),
  ('11111111-0020-0000-0000-000000000001', 2022, 'ready_for_payment', 'pending',now()-interval '6 days',  now()-interval '1 day',   null, null)
ON CONFLICT (user_id, tax_year) DO NOTHING;

-- ============================================================
-- Step 4: Add some status log entries for realism
-- ============================================================

INSERT INTO public.status_logs (application_id, old_status, new_status, changed_by, reason, created_at)
SELECT
  a.id,
  'draft',
  'submitted',
  '11111111-0001-0000-0000-000000000001',
  'All documents verified and submitted to Finanzamt',
  now() - interval '5 days'
FROM public.applications a
WHERE a.user_id = '11111111-0001-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.status_logs (application_id, old_status, new_status, changed_by, reason, created_at)
SELECT
  a.id,
  'submitted',
  'completed',
  '11111111-0003-0000-0000-000000000001',
  'Tax refund processed by Finanzamt. €1,840 transferred.',
  now() - interval '10 days'
FROM public.applications a
WHERE a.user_id = '11111111-0003-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE. You now have 20 users + 20 applications.
-- All users can log in with password: Test1234!
-- ============================================================
