-- ============================================================
-- 003_seed_more_users.sql
-- 20 additional demo users covering every application status
-- with full profiles, timelines, documents, notes & payments
-- ============================================================

DO $$
DECLARE
  admin_id uuid;

  -- User UUIDs (20 fake users)
  u01 uuid := 'bb000001-0000-0000-0000-000000000001';
  u02 uuid := 'bb000001-0000-0000-0000-000000000002';
  u03 uuid := 'bb000001-0000-0000-0000-000000000003';
  u04 uuid := 'bb000001-0000-0000-0000-000000000004';
  u05 uuid := 'bb000001-0000-0000-0000-000000000005';
  u06 uuid := 'bb000001-0000-0000-0000-000000000006';
  u07 uuid := 'bb000001-0000-0000-0000-000000000007';
  u08 uuid := 'bb000001-0000-0000-0000-000000000008';
  u09 uuid := 'bb000001-0000-0000-0000-000000000009';
  u10 uuid := 'bb000001-0000-0000-0000-000000000010';
  u11 uuid := 'bb000001-0000-0000-0000-000000000011';
  u12 uuid := 'bb000001-0000-0000-0000-000000000012';
  u13 uuid := 'bb000001-0000-0000-0000-000000000013';
  u14 uuid := 'bb000001-0000-0000-0000-000000000014';
  u15 uuid := 'bb000001-0000-0000-0000-000000000015';
  u16 uuid := 'bb000001-0000-0000-0000-000000000016';
  u17 uuid := 'bb000001-0000-0000-0000-000000000017';
  u18 uuid := 'bb000001-0000-0000-0000-000000000018';
  u19 uuid := 'bb000001-0000-0000-0000-000000000019';
  u20 uuid := 'bb000001-0000-0000-0000-000000000020';

  -- Application UUIDs
  a01 uuid := 'cc000001-0000-0000-0000-000000000001';
  a02 uuid := 'cc000001-0000-0000-0000-000000000002';
  a03 uuid := 'cc000001-0000-0000-0000-000000000003';
  a04 uuid := 'cc000001-0000-0000-0000-000000000004';
  a05 uuid := 'cc000001-0000-0000-0000-000000000005';
  a06 uuid := 'cc000001-0000-0000-0000-000000000006';
  a07 uuid := 'cc000001-0000-0000-0000-000000000007';
  a08 uuid := 'cc000001-0000-0000-0000-000000000008';
  a09 uuid := 'cc000001-0000-0000-0000-000000000009';
  a10 uuid := 'cc000001-0000-0000-0000-000000000010';
  a11 uuid := 'cc000001-0000-0000-0000-000000000011';
  a12 uuid := 'cc000001-0000-0000-0000-000000000012';
  a13 uuid := 'cc000001-0000-0000-0000-000000000013';
  a14 uuid := 'cc000001-0000-0000-0000-000000000014';
  a15 uuid := 'cc000001-0000-0000-0000-000000000015';
  a16 uuid := 'cc000001-0000-0000-0000-000000000016';
  a17 uuid := 'cc000001-0000-0000-0000-000000000017';
  a18 uuid := 'cc000001-0000-0000-0000-000000000018';
  a19 uuid := 'cc000001-0000-0000-0000-000000000019';
  a20 uuid := 'cc000001-0000-0000-0000-000000000020';

BEGIN
  -- Get existing admin ID
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN admin_id := u01; END IF;

  -- ─────────────────────────────────────────────────────────────
  -- 1. AUTH USERS
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new
  ) VALUES
    (u01,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','aleksandar.petrovski@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'3 days',now()-interval'3 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u02,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','marija.ilieva@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'7 days',now()-interval'7 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u03,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stefan.stojanov@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'12 days',now()-interval'12 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u04,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','elena.ristovska@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'20 days',now()-interval'20 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u05,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','filip.georgievski@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'25 days',now()-interval'25 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u06,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','nikola.jovanovic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'32 days',now()-interval'32 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u07,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','milica.petrovic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'38 days',now()-interval'38 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u08,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','arlind.berisha@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'45 days',now()-interval'45 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u09,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','blerta.krasniqi@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'52 days',now()-interval'52 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u10,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','georgi.petrov@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'62 days',now()-interval'62 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u11,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','maria.georgieva@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'72 days',now()-interval'72 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u12,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','teodora.pavlovska@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'82 days',now()-interval'82 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u13,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','bojan.stojanovic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'90 days',now()-interval'90 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u14,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','ana.nikolova@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'100 days',now()-interval'100 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u15,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','kristijan.dimitrievski@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'110 days',now()-interval'110 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u16,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','tatjana.milosevic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'120 days',now()-interval'120 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u17,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','dragan.todorovic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'130 days',now()-interval'130 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u18,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','vesna.jovanovska@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'145 days',now()-interval'145 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u19,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','dejan.petrovic@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'155 days',now()-interval'155 days',now(),'{"provider":"email","providers":["email"]}','{}','','',''),
    (u20,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','risto.naumoski@gmail.com',crypt('Demo1234!',gen_salt('bf')),now()-interval'105 days',now()-interval'105 days',now(),'{"provider":"email","providers":["email"]}','{}','','','')
  ON CONFLICT (id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 2. PUBLIC USERS (trigger creates these, but explicit fallback)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO public.users (id, email, role, is_active, created_at) VALUES
    (u01,'aleksandar.petrovski@gmail.com','user',true,now()-interval'3 days'),
    (u02,'marija.ilieva@gmail.com','user',true,now()-interval'7 days'),
    (u03,'stefan.stojanov@gmail.com','user',true,now()-interval'12 days'),
    (u04,'elena.ristovska@gmail.com','user',true,now()-interval'20 days'),
    (u05,'filip.georgievski@gmail.com','user',true,now()-interval'25 days'),
    (u06,'nikola.jovanovic@gmail.com','user',true,now()-interval'32 days'),
    (u07,'milica.petrovic@gmail.com','user',true,now()-interval'38 days'),
    (u08,'arlind.berisha@gmail.com','user',true,now()-interval'45 days'),
    (u09,'blerta.krasniqi@gmail.com','user',true,now()-interval'52 days'),
    (u10,'georgi.petrov@gmail.com','user',true,now()-interval'62 days'),
    (u11,'maria.georgieva@gmail.com','user',true,now()-interval'72 days'),
    (u12,'teodora.pavlovska@gmail.com','user',true,now()-interval'82 days'),
    (u13,'bojan.stojanovic@gmail.com','user',true,now()-interval'90 days'),
    (u14,'ana.nikolova@gmail.com','user',true,now()-interval'100 days'),
    (u15,'kristijan.dimitrievski@gmail.com','user',true,now()-interval'110 days'),
    (u16,'tatjana.milosevic@gmail.com','user',true,now()-interval'120 days'),
    (u17,'dragan.todorovic@gmail.com','user',true,now()-interval'130 days'),
    (u18,'vesna.jovanovska@gmail.com','user',true,now()-interval'145 days'),
    (u19,'dejan.petrovic@gmail.com','user',true,now()-interval'155 days'),
    (u20,'risto.naumoski@gmail.com','user',true,now()-interval'105 days')
  ON CONFLICT (id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 3. PROFILES
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO profiles (
    user_id, first_name, last_name, date_of_birth, nationality, phone,
    country_of_residence, city, address, passport_number,
    tax_id, student_status, university,
    employer_name, work_start, work_end, gross_income_eur,
    bank_name, iban, swift_bic, bank_account_holder, bank_country,
    profile_complete, updated_at
  ) VALUES
    -- u01 Aleksandar Petrovski – DRAFT (minimal profile)
    (u01,'Aleksandar','Petrovski','1995-03-14','Macedonian','+38978123001',
     'North Macedonia','Skopje','ul. Partizanska 12',NULL,
     NULL,false,NULL,
     NULL,NULL,NULL,NULL,
     NULL,NULL,NULL,NULL,NULL,
     false,now()-interval'3 days'),

    -- u02 Marija Ilieva – PROFILE_INCOMPLETE (partial)
    (u02,'Marija','Ilieva','1993-07-22','Macedonian','+38978456002',
     'North Macedonia','Bitola','ul. Kliment Ohridski 5',NULL,
     NULL,false,NULL,
     'Mercedes-Benz AG','2023-03-01','2023-11-30',32400,
     NULL,NULL,NULL,NULL,NULL,
     false,now()-interval'7 days'),

    -- u03 Stefan Stojanov – PROFILE_INCOMPLETE (partial)
    (u03,'Stefan','Stojanov','1990-11-05','Serbian','+381641230003',
     'Serbia','Beograd','Bulevar Oslobodjenja 88',NULL,
     NULL,false,NULL,
     'Volkswagen AG','2022-01-15','2022-12-31',38500,
     NULL,NULL,NULL,NULL,NULL,
     false,now()-interval'12 days'),

    -- u04 Elena Ristovska – DOCUMENTS_PENDING (full profile)
    (u04,'Elena','Ristovska','1997-05-19','Macedonian','+38978789004',
     'North Macedonia','Tetovo','ul. Ilindenska 33','M1234567',
     '12 345 678 901',false,NULL,
     'Amazon Logistik GmbH','2023-04-01','2023-12-31',28800,
     'Sparkasse','DE91100000000123456789','BELADEBEXXX','Elena Ristovska','Germany',
     true,now()-interval'20 days'),

    -- u05 Filip Georgievski – DOCUMENTS_PENDING (full profile)
    (u05,'Filip','Georgievski','1992-09-30','Macedonian','+38978321005',
     'North Macedonia','Ohrid','ul. Car Samoil 7','M7654321',
     '34 567 890 123',false,NULL,
     'DHL Supply Chain GmbH','2022-02-14','2022-11-15',26400,
     'Commerzbank','DE52200400600528013800','COBADEFFXXX','Filip Georgievski','Germany',
     true,now()-interval'25 days'),

    -- u06 Nikola Jovanovic – READY_FOR_PAYMENT (full profile)
    (u06,'Nikola','Jovanovic','1988-02-28','Serbian','+381641560006',
     'Serbia','Novi Sad','Fruskogorska 14','P12345678',
     '56 789 012 345',false,NULL,
     'Robert Bosch GmbH','2023-03-01','2023-12-31',36000,
     'Deutsche Bank','DE89370400440532013000','DEUTDEDBXXX','Nikola Jovanovic','Germany',
     true,now()-interval'32 days'),

    -- u07 Milica Petrovic – READY_FOR_PAYMENT (full profile)
    (u07,'Milica','Petrovic','1994-12-11','Serbian','+381641890007',
     'Serbia','Nis','Bulevar Nemanjica 52','P98765432',
     '78 901 234 567',true,'University of Nis',
     'Continental AG','2022-04-01','2022-10-31',29200,
     'Raiffeisenbank','DE75200505501015871393','RZBDDE5DXXX','Milica Petrovic','Germany',
     true,now()-interval'38 days'),

    -- u08 Arlind Berisha – PAID (full profile)
    (u08,'Arlind','Berisha','1991-06-15','Albanian','+38978654008',
     'North Macedonia','Gostivar','ul. Braka Ginoski 22','A2345678',
     '90 123 456 789',false,NULL,
     'DB Schenker AG','2023-01-16','2023-12-20',31200,
     'ProCredit Bank MK','MK07200000000000100','PRCBMK2XXXX','Arlind Berisha','North Macedonia',
     true,now()-interval'45 days'),

    -- u09 Blerta Krasniqi – PAID (full profile)
    (u09,'Blerta','Krasniqi','1996-03-08','Albanian','+38978987009',
     'North Macedonia','Tetovo','ul. 11 Oktomvri 18','A8765432',
     '01 234 567 890',true,'State University of Tetova',
     'Lidl Stiftung & Co KG','2022-06-01','2022-12-15',24800,
     'Stopanska Banka','MK07220000000000300','STOBMK2XXXX','Blerta Krasniqi','North Macedonia',
     true,now()-interval'52 days'),

    -- u10 Georgi Petrov – IN_REVIEW (full profile)
    (u10,'Georgi','Petrov','1987-08-23','Bulgarian','+359887123010',
     'Bulgaria','Sofia','ul. Vitosha 101','BG1234567',
     '23 456 789 012',false,NULL,
     'Siemens AG','2023-02-01','2023-11-30',42000,
     'Deutsche Bank','DE27100208900098021368','DEUTDEDBXXX','Georgi Petrov','Germany',
     true,now()-interval'62 days'),

    -- u11 Maria Georgieva – IN_REVIEW (full profile)
    (u11,'Maria','Georgieva','1993-04-17','Bulgarian','+359887456011',
     'Bulgaria','Plovdiv','bul. Hristo Botev 44','BG9876543',
     '45 678 901 234',false,NULL,
     'Deutsche Bahn AG','2022-03-01','2022-12-31',34800,
     'Commerzbank','DE44200400600199012502','COBADEFFXXX','Maria Georgieva','Germany',
     true,now()-interval'72 days'),

    -- u12 Teodora Pavlovska – MISSING_DOCUMENTS (full profile)
    (u12,'Teodora','Pavlovska','1998-01-30','Macedonian','+38978111012',
     'North Macedonia','Stip','ul. Bregalnicka 9','M3456789',
     '67 890 123 456',true,'Goce Delcev University Stip',
     'EDEKA Zentrale AG','2023-05-01','2023-12-31',27600,
     'Sparkasse','DE02120300000000202051','BELADEBEXXX','Teodora Pavlovska','Germany',
     true,now()-interval'82 days'),

    -- u13 Bojan Stojanovic – MISSING_DOCUMENTS (full profile)
    (u13,'Bojan','Stojanovic','1985-10-14','Serbian','+381641222013',
     'Serbia','Kragujevac','ul. Svetozara Markovica 7','P11223344',
     '89 012 345 678',false,NULL,
     'Kaufland Dienstleistung GmbH','2022-01-10','2022-12-10',32400,
     'Banca Intesa','RS35105008123123123173','DBDBRSBGXXX','Bojan Stojanovic','Serbia',
     true,now()-interval'90 days'),

    -- u14 Ana Nikolova – READY_FOR_SUBMISSION (full profile)
    (u14,'Ana','Nikolova','1994-07-04','Macedonian','+38978333014',
     'North Macedonia','Veles','ul. Makedonska 15','M5678901',
     '12 098 765 432',false,NULL,
     'REWE Markt GmbH','2023-01-09','2023-12-22',29400,
     'NLB Banka','MK07250000000000200','TUTNMK22XXX','Ana Nikolova','North Macedonia',
     true,now()-interval'100 days'),

    -- u15 Kristijan Dimitrievski – READY_FOR_SUBMISSION (full profile)
    (u15,'Kristijan','Dimitrievski','1990-02-25','Macedonian','+38978444015',
     'North Macedonia','Skopje','ul. Vodnjanska 28','M2109876',
     '34 210 987 654',false,NULL,
     'Aldi Einkauf SE & Co','2022-03-14','2022-12-14',26800,
     'Halk Banka','MK07320000000000400','HALBMK22XXX','Kristijan Dimitrievski','North Macedonia',
     true,now()-interval'110 days'),

    -- u16 Tatjana Milosevic – SUBMITTED (full profile)
    (u16,'Tatjana','Milosevic','1989-05-18','Serbian','+381641555016',
     'Serbia','Subotica','ul. Korzo 3','P55667788',
     '56 432 109 876',false,NULL,
     'GLS General Logistics Systems','2023-02-01','2023-11-30',28000,
     'Raiffeisenbank','DE41200505501049856867','RZBDDE5DXXX','Tatjana Milosevic','Germany',
     true,now()-interval'120 days'),

    -- u17 Dragan Todorovic – SUBMITTED (full profile)
    (u17,'Dragan','Todorovic','1982-09-09','Serbian','+381641888017',
     'Serbia','Beograd','ul. Knez Mihailova 42','P99887766',
     '78 654 321 098',false,NULL,
     'METRO AG','2022-01-03','2022-12-30',44000,
     'OTP Banka','RS35355004080012001015','OTPVRS22XXX','Dragan Todorovic','Serbia',
     true,now()-interval'130 days'),

    -- u18 Vesna Jovanovska – COMPLETED (full profile)
    (u18,'Vesna','Jovanovska','1991-11-26','Macedonian','+38978777018',
     'North Macedonia','Skopje','ul. Dame Gruev 6','M6543210',
     '90 876 543 210',false,NULL,
     'Deutsche Post AG','2023-01-15','2023-12-15',32000,
     'Sparkasse','DE73100000002345678901','BELADEBEXXX','Vesna Jovanovska','Germany',
     true,now()-interval'145 days'),

    -- u19 Dejan Petrovic – COMPLETED (full profile)
    (u19,'Dejan','Petrovic','1986-04-03','Serbian','+381641999019',
     'Serbia','Novi Sad','Bulevar Cara Lazara 12','P44556677',
     '01 098 765 432',false,NULL,
     'Daimler Truck AG','2022-04-01','2022-12-31',48000,
     'Commerzbank','DE71200400600232671200','COBADEFFXXX','Dejan Petrovic','Germany',
     true,now()-interval'155 days'),

    -- u20 Risto Naumoski – REJECTED (full profile)
    (u20,'Risto','Naumoski','1988-08-17','Macedonian','+38978666020',
     'North Macedonia','Strumica','ul. Goce Delcev 31','M8765432',
     '23 109 876 543',false,NULL,
     'DB Schenker Logistics','2022-05-01','2022-10-31',24000,
     'Stopanska Banka','MK07220000000000500','STOBMK2XXXX','Risto Naumoski','North Macedonia',
     true,now()-interval'105 days')
  ON CONFLICT (user_id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 4. APPLICATIONS
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO applications (
    id, user_id, tax_year, applicant_name, country, status, payment_status,
    refund_amount, created_at, updated_at, submitted_at, completed_at
  ) VALUES
    (a01,u01,2023,'Aleksandar Petrovski','Germany','draft','unpaid',NULL,now()-interval'3 days',now()-interval'3 days',NULL,NULL),
    (a02,u02,2023,'Marija Ilieva','Germany','profile_incomplete','unpaid',NULL,now()-interval'7 days',now()-interval'5 days',NULL,NULL),
    (a03,u03,2022,'Stefan Stojanov','Germany','profile_incomplete','unpaid',NULL,now()-interval'12 days',now()-interval'10 days',NULL,NULL),
    (a04,u04,2023,'Elena Ristovska','Germany','documents_pending','unpaid',NULL,now()-interval'20 days',now()-interval'14 days',NULL,NULL),
    (a05,u05,2022,'Filip Georgievski','Germany','documents_pending','unpaid',NULL,now()-interval'25 days',now()-interval'18 days',NULL,NULL),
    (a06,u06,2023,'Nikola Jovanovic','Germany','ready_for_payment','unpaid',NULL,now()-interval'32 days',now()-interval'10 days',NULL,NULL),
    (a07,u07,2022,'Milica Petrovic','Germany','ready_for_payment','unpaid',NULL,now()-interval'38 days',now()-interval'12 days',NULL,NULL),
    (a08,u08,2023,'Arlind Berisha','Germany','paid','paid',NULL,now()-interval'45 days',now()-interval'8 days',NULL,NULL),
    (a09,u09,2022,'Blerta Krasniqi','Germany','paid','paid',NULL,now()-interval'52 days',now()-interval'10 days',NULL,NULL),
    (a10,u10,2023,'Georgi Petrov','Germany','in_review','paid',NULL,now()-interval'62 days',now()-interval'5 days',NULL,NULL),
    (a11,u11,2022,'Maria Georgieva','Germany','in_review','paid',NULL,now()-interval'72 days',now()-interval'7 days',NULL,NULL),
    (a12,u12,2023,'Teodora Pavlovska','Germany','missing_documents','unpaid',NULL,now()-interval'82 days',now()-interval'6 days',NULL,NULL),
    (a13,u13,2022,'Bojan Stojanovic','Germany','missing_documents','unpaid',NULL,now()-interval'90 days',now()-interval'8 days',NULL,NULL),
    (a14,u14,2023,'Ana Nikolova','Germany','ready_for_submission','paid',NULL,now()-interval'100 days',now()-interval'4 days',NULL,NULL),
    (a15,u15,2022,'Kristijan Dimitrievski','Germany','ready_for_submission','paid',NULL,now()-interval'110 days',now()-interval'6 days',NULL,NULL),
    (a16,u16,2023,'Tatjana Milosevic','Germany','submitted','paid',NULL,now()-interval'120 days',now()-interval'25 days',NULL,now()-interval'25 days'),
    (a17,u17,2022,'Dragan Todorovic','Germany','submitted','paid',NULL,now()-interval'130 days',now()-interval'30 days',NULL,now()-interval'30 days'),
    (a18,u18,2023,'Vesna Jovanovska','Germany','completed','paid',874.50,now()-interval'145 days',now()-interval'10 days',now()-interval'90 days',now()-interval'10 days'),
    (a19,u19,2022,'Dejan Petrovic','Germany','completed','paid',1250.00,now()-interval'155 days',now()-interval'12 days',now()-interval'100 days',now()-interval'12 days'),
    (a20,u20,2022,'Risto Naumoski','Germany','rejected','unpaid',NULL,now()-interval'105 days',now()-interval'20 days',NULL,NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ─────────────────────────────────────────────────────────────
  -- 5. STATUS LOGS  (realistic timelines per application)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO status_logs (application_id, old_status, new_status, changed_by, reason, created_at) VALUES
    -- a01 draft (just created)
    (a01,NULL,'draft',u01,'Application created',now()-interval'3 days'),

    -- a02 profile_incomplete
    (a02,NULL,'draft',u02,'Application created',now()-interval'7 days'),
    (a02,'draft','profile_incomplete',admin_id,'Profile data incomplete — missing employment and banking details',now()-interval'5 days'),

    -- a03 profile_incomplete
    (a03,NULL,'draft',u03,'Application created',now()-interval'12 days'),
    (a03,'draft','profile_incomplete',admin_id,'Profile incomplete — IBAN and employer details missing',now()-interval'10 days'),

    -- a04 documents_pending
    (a04,NULL,'draft',u04,'Application created',now()-interval'20 days'),
    (a04,'draft','profile_incomplete',admin_id,'Profile needs completion',now()-interval'18 days'),
    (a04,'profile_incomplete','documents_pending',u04,'Profile completed, ready to upload documents',now()-interval'14 days'),

    -- a05 documents_pending
    (a05,NULL,'draft',u05,'Application created',now()-interval'25 days'),
    (a05,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'23 days'),
    (a05,'profile_incomplete','documents_pending',u05,'Profile completed',now()-interval'18 days'),

    -- a06 ready_for_payment
    (a06,NULL,'draft',u06,'Application created',now()-interval'32 days'),
    (a06,'draft','profile_incomplete',admin_id,'Profile needs completion',now()-interval'30 days'),
    (a06,'profile_incomplete','documents_pending',u06,'Profile completed',now()-interval'26 days'),
    (a06,'documents_pending','ready_for_payment',admin_id,'All documents verified and approved',now()-interval'10 days'),

    -- a07 ready_for_payment
    (a07,NULL,'draft',u07,'Application created',now()-interval'38 days'),
    (a07,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'36 days'),
    (a07,'profile_incomplete','documents_pending',u07,'Profile completed',now()-interval'30 days'),
    (a07,'documents_pending','ready_for_payment',admin_id,'Documents reviewed — all approved. Payment required.',now()-interval'12 days'),

    -- a08 paid
    (a08,NULL,'draft',u08,'Application created',now()-interval'45 days'),
    (a08,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'43 days'),
    (a08,'profile_incomplete','documents_pending',u08,'Profile completed',now()-interval'36 days'),
    (a08,'documents_pending','ready_for_payment',admin_id,'All documents approved',now()-interval'18 days'),
    (a08,'ready_for_payment','paid',admin_id,'Payment received — cash payment recorded by agent',now()-interval'8 days'),

    -- a09 paid
    (a09,NULL,'draft',u09,'Application created',now()-interval'52 days'),
    (a09,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'50 days'),
    (a09,'profile_incomplete','documents_pending',u09,'Profile completed',now()-interval'42 days'),
    (a09,'documents_pending','ready_for_payment',admin_id,'Documents verified',now()-interval'20 days'),
    (a09,'ready_for_payment','paid',u09,'Online payment completed',now()-interval'10 days'),

    -- a10 in_review
    (a10,NULL,'draft',u10,'Application created',now()-interval'62 days'),
    (a10,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'60 days'),
    (a10,'profile_incomplete','documents_pending',u10,'Profile complete',now()-interval'50 days'),
    (a10,'documents_pending','ready_for_payment',admin_id,'All documents approved',now()-interval'25 days'),
    (a10,'ready_for_payment','paid',u10,'Stripe payment confirmed',now()-interval'12 days'),
    (a10,'paid','in_review',admin_id,'Payment verified — tax return preparation started',now()-interval'5 days'),

    -- a11 in_review
    (a11,NULL,'draft',u11,'Application created',now()-interval'72 days'),
    (a11,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'70 days'),
    (a11,'profile_incomplete','documents_pending',u11,'Profile complete',now()-interval'60 days'),
    (a11,'documents_pending','ready_for_payment',admin_id,'All documents verified',now()-interval'30 days'),
    (a11,'ready_for_payment','paid',u11,'Payment completed',now()-interval'14 days'),
    (a11,'paid','in_review',admin_id,'Tax return preparation in progress',now()-interval'7 days'),

    -- a12 missing_documents
    (a12,NULL,'draft',u12,'Application created',now()-interval'82 days'),
    (a12,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'80 days'),
    (a12,'profile_incomplete','documents_pending',u12,'Profile completed',now()-interval'70 days'),
    (a12,'documents_pending','missing_documents',admin_id,'Lohnsteuerbescheinigung blurry — passport expired. Please reupload.',now()-interval'6 days'),

    -- a13 missing_documents
    (a13,NULL,'draft',u13,'Application created',now()-interval'90 days'),
    (a13,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'88 days'),
    (a13,'profile_incomplete','documents_pending',u13,'Profile complete',now()-interval'78 days'),
    (a13,'documents_pending','missing_documents',admin_id,'Bank proof missing — please upload a document showing your IBAN',now()-interval'8 days'),

    -- a14 ready_for_submission
    (a14,NULL,'draft',u14,'Application created',now()-interval'100 days'),
    (a14,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'98 days'),
    (a14,'profile_incomplete','documents_pending',u14,'Profile complete',now()-interval'88 days'),
    (a14,'documents_pending','missing_documents',admin_id,'Work contract unclear — please upload legible copy',now()-interval'30 days'),
    (a14,'missing_documents','documents_pending',u14,'New work contract uploaded',now()-interval'20 days'),
    (a14,'documents_pending','ready_for_payment',admin_id,'All documents now approved',now()-interval'12 days'),
    (a14,'ready_for_payment','paid',u14,'Bank transfer received',now()-interval'6 days'),
    (a14,'paid','ready_for_submission',admin_id,'Tax return prepared and ready for Finanzamt submission',now()-interval'4 days'),

    -- a15 ready_for_submission
    (a15,NULL,'draft',u15,'Application created',now()-interval'110 days'),
    (a15,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'108 days'),
    (a15,'profile_incomplete','documents_pending',u15,'Profile complete',now()-interval'96 days'),
    (a15,'documents_pending','ready_for_payment',admin_id,'All documents approved',now()-interval'20 days'),
    (a15,'ready_for_payment','paid',u15,'Payment confirmed',now()-interval'10 days'),
    (a15,'paid','ready_for_submission',admin_id,'Tax return ready for submission to Finanzamt',now()-interval'6 days'),

    -- a16 submitted
    (a16,NULL,'draft',u16,'Application created',now()-interval'120 days'),
    (a16,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'118 days'),
    (a16,'profile_incomplete','documents_pending',u16,'Profile complete',now()-interval'105 days'),
    (a16,'documents_pending','ready_for_payment',admin_id,'All documents verified',now()-interval'50 days'),
    (a16,'ready_for_payment','paid',u16,'Stripe payment confirmed',now()-interval'42 days'),
    (a16,'paid','in_review',admin_id,'Tax return preparation started',now()-interval'38 days'),
    (a16,'in_review','ready_for_submission',admin_id,'Tax return finalized',now()-interval'28 days'),
    (a16,'ready_for_submission','submitted',admin_id,'Submitted to Finanzamt München — Ref. FA-2024-MUC-081234',now()-interval'25 days'),

    -- a17 submitted
    (a17,NULL,'draft',u17,'Application created',now()-interval'130 days'),
    (a17,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'128 days'),
    (a17,'profile_incomplete','documents_pending',u17,'Profile complete',now()-interval'115 days'),
    (a17,'documents_pending','ready_for_payment',admin_id,'Documents approved',now()-interval'60 days'),
    (a17,'ready_for_payment','paid',u17,'Payment confirmed',now()-interval'52 days'),
    (a17,'paid','in_review',admin_id,'Preparation in progress',now()-interval'48 days'),
    (a17,'in_review','ready_for_submission',admin_id,'Tax return prepared',now()-interval'35 days'),
    (a17,'ready_for_submission','submitted',admin_id,'Submitted to Finanzamt Stuttgart — Ref. FA-2023-STG-044567',now()-interval'30 days'),

    -- a18 completed
    (a18,NULL,'draft',u18,'Application created',now()-interval'145 days'),
    (a18,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'143 days'),
    (a18,'profile_incomplete','documents_pending',u18,'Profile complete',now()-interval'130 days'),
    (a18,'documents_pending','ready_for_payment',admin_id,'All documents approved',now()-interval'85 days'),
    (a18,'ready_for_payment','paid',u18,'Stripe payment confirmed',now()-interval'78 days'),
    (a18,'paid','in_review',admin_id,'Tax return preparation started',now()-interval'72 days'),
    (a18,'in_review','ready_for_submission',admin_id,'Tax return finalized',now()-interval'62 days'),
    (a18,'ready_for_submission','submitted',admin_id,'Submitted to Finanzamt Bonn',now()-interval'90 days'),
    (a18,'submitted','completed',admin_id,'Refund of €874.50 received and transferred to applicant',now()-interval'10 days'),

    -- a19 completed
    (a19,NULL,'draft',u19,'Application created',now()-interval'155 days'),
    (a19,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'153 days'),
    (a19,'profile_incomplete','documents_pending',u19,'Profile complete',now()-interval'140 days'),
    (a19,'documents_pending','ready_for_payment',admin_id,'All documents approved',now()-interval'95 days'),
    (a19,'ready_for_payment','paid',u19,'Bank transfer confirmed',now()-interval'88 days'),
    (a19,'paid','in_review',admin_id,'Tax return preparation started',now()-interval'82 days'),
    (a19,'in_review','ready_for_submission',admin_id,'Finalized',now()-interval'72 days'),
    (a19,'ready_for_submission','submitted',admin_id,'Submitted to Finanzamt Hannover — Ref. FA-2022-HAN-029811',now()-interval'100 days'),
    (a19,'submitted','completed',admin_id,'Refund €1,250.00 confirmed by Finanzamt and forwarded',now()-interval'12 days'),

    -- a20 rejected
    (a20,NULL,'draft',u20,'Application created',now()-interval'105 days'),
    (a20,'draft','profile_incomplete',admin_id,'Profile incomplete',now()-interval'103 days'),
    (a20,'profile_incomplete','documents_pending',u20,'Profile complete',now()-interval'92 days'),
    (a20,'documents_pending','missing_documents',admin_id,'Lohnsteuer for 2022 not found — applicant only worked 5 months. Tax threshold not met.',now()-interval'25 days'),
    (a20,'missing_documents','rejected',admin_id,'Insufficient German income in 2022 (under €11,604 threshold). Refund not applicable.',now()-interval'20 days');

  -- ─────────────────────────────────────────────────────────────
  -- 6. DOCUMENTS
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO documents (
    application_id, document_type, file_path, file_name, file_size, mime_type,
    review_status, admin_note, reviewed_by, reviewed_at, created_at
  ) VALUES
    -- a04 Elena (documents_pending) — 3 docs uploaded, pending review
    (a04,'passport',u04||'/'||a04||'/passport/reisepass_elena.pdf','reisepass_elena.pdf',345600,'application/pdf','pending',NULL,NULL,NULL,now()-interval'13 days'),
    (a04,'lohnsteuer',u04||'/'||a04||'/lohnsteuer/lohnsteuer_2023_elena.pdf','lohnsteuer_2023_elena.pdf',412800,'application/pdf','pending',NULL,NULL,NULL,now()-interval'13 days'),
    (a04,'payslip',u04||'/'||a04||'/payslip/payslips_q4_2023.pdf','payslips_q4_2023.pdf',524288,'application/pdf','pending',NULL,NULL,NULL,now()-interval'12 days'),

    -- a05 Filip (documents_pending) — 2 docs pending
    (a05,'passport',u05||'/'||a05||'/passport/passport_filip.pdf','passport_filip.pdf',302080,'application/pdf','pending',NULL,NULL,NULL,now()-interval'17 days'),
    (a05,'lohnsteuer',u05||'/'||a05||'/lohnsteuer/lohnsteuer_2022.pdf','lohnsteuer_2022.pdf',389120,'application/pdf','pending',NULL,NULL,NULL,now()-interval'16 days'),

    -- a06 Nikola (ready_for_payment) — docs approved
    (a06,'passport',u06||'/'||a06||'/passport/passport_nikola.pdf','passport_nikola.pdf',287744,'application/pdf','approved',NULL,admin_id,now()-interval'11 days',now()-interval'26 days'),
    (a06,'lohnsteuer',u06||'/'||a06||'/lohnsteuer/lohnsteuer_2023.pdf','lohnsteuer_2023.pdf',430080,'application/pdf','approved',NULL,admin_id,now()-interval'11 days',now()-interval'25 days'),
    (a06,'payslip',u06||'/'||a06||'/payslip/payslips_nikola.pdf','payslips_nikola.pdf',614400,'application/pdf','approved',NULL,admin_id,now()-interval'10 days',now()-interval'24 days'),
    (a06,'work_contract',u06||'/'||a06||'/work_contract/arbeitsvertrag_nikola.pdf','arbeitsvertrag_nikola.pdf',256000,'application/pdf','approved',NULL,admin_id,now()-interval'10 days',now()-interval'24 days'),

    -- a07 Milica (ready_for_payment) — docs approved
    (a07,'passport',u07||'/'||a07||'/passport/passport_milica.pdf','passport_milica.pdf',298496,'application/pdf','approved',NULL,admin_id,now()-interval'13 days',now()-interval'30 days'),
    (a07,'lohnsteuer',u07||'/'||a07||'/lohnsteuer/lohnsteuer_2022_milica.pdf','lohnsteuer_2022_milica.pdf',445440,'application/pdf','approved',NULL,admin_id,now()-interval'13 days',now()-interval'29 days'),
    (a07,'student_proof',u07||'/'||a07||'/student_proof/studentski_indeks.pdf','studentski_indeks.pdf',189440,'application/pdf','approved',NULL,admin_id,now()-interval'12 days',now()-interval'28 days'),

    -- a08 Arlind (paid) — all docs approved
    (a08,'passport',u08||'/'||a08||'/passport/passport_arlind.pdf','passport_arlind.pdf',315392,'application/pdf','approved',NULL,admin_id,now()-interval'20 days',now()-interval'36 days'),
    (a08,'lohnsteuer',u08||'/'||a08||'/lohnsteuer/lohnsteuer_arlind_2023.pdf','lohnsteuer_arlind_2023.pdf',401408,'application/pdf','approved',NULL,admin_id,now()-interval'19 days',now()-interval'35 days'),
    (a08,'payslip',u08||'/'||a08||'/payslip/gehaltsnachweise.pdf','gehaltsnachweise.pdf',573440,'application/pdf','approved',NULL,admin_id,now()-interval'18 days',now()-interval'34 days'),
    (a08,'bank_proof',u08||'/'||a08||'/bank_proof/bank_statement_arlind.pdf','bank_statement_arlind.pdf',221184,'application/pdf','approved',NULL,admin_id,now()-interval'18 days',now()-interval'33 days'),

    -- a09 Blerta (paid) — all docs approved
    (a09,'passport',u09||'/'||a09||'/passport/passport_blerta.pdf','passport_blerta.pdf',289792,'application/pdf','approved',NULL,admin_id,now()-interval'22 days',now()-interval'42 days'),
    (a09,'lohnsteuer',u09||'/'||a09||'/lohnsteuer/lohnsteuer_2022_blerta.pdf','lohnsteuer_2022_blerta.pdf',418816,'application/pdf','approved',NULL,admin_id,now()-interval'21 days',now()-interval'41 days'),
    (a09,'student_proof',u09||'/'||a09||'/student_proof/upis_tetovo.pdf','upis_tetovo.pdf',176128,'application/pdf','approved',NULL,admin_id,now()-interval'21 days',now()-interval'40 days'),

    -- a10 Georgi (in_review) — all approved
    (a10,'passport',u10||'/'||a10||'/passport/reisepass_georgi.pdf','reisepass_georgi.pdf',334848,'application/pdf','approved',NULL,admin_id,now()-interval'28 days',now()-interval'50 days'),
    (a10,'lohnsteuer',u10||'/'||a10||'/lohnsteuer/lohnsteuer_georgi_2023.pdf','lohnsteuer_georgi_2023.pdf',456704,'application/pdf','approved',NULL,admin_id,now()-interval'27 days',now()-interval'48 days'),
    (a10,'payslip',u10||'/'||a10||'/payslip/pay_slips_georgi.pdf','pay_slips_georgi.pdf',638976,'application/pdf','approved',NULL,admin_id,now()-interval'26 days',now()-interval'47 days'),
    (a10,'work_contract',u10||'/'||a10||'/work_contract/arbeitsvertrag_georgi.pdf','arbeitsvertrag_georgi.pdf',270336,'application/pdf','approved',NULL,admin_id,now()-interval'25 days',now()-interval'46 days'),

    -- a11 Maria (in_review) — all approved
    (a11,'passport',u11||'/'||a11||'/passport/passport_maria.pdf','passport_maria.pdf',303104,'application/pdf','approved',NULL,admin_id,now()-interval'33 days',now()-interval'60 days'),
    (a11,'lohnsteuer',u11||'/'||a11||'/lohnsteuer/lohnsteuer_maria_2022.pdf','lohnsteuer_maria_2022.pdf',436224,'application/pdf','approved',NULL,admin_id,now()-interval'32 days',now()-interval'58 days'),
    (a11,'payslip',u11||'/'||a11||'/payslip/payslips_maria.pdf','payslips_maria.pdf',598016,'application/pdf','approved',NULL,admin_id,now()-interval'31 days',now()-interval'56 days'),

    -- a12 Teodora (missing_documents) — mixed
    (a12,'passport',u12||'/'||a12||'/passport/passport_teodora.pdf','passport_teodora.pdf',276480,'application/pdf','needs_reupload','Passport appears expired (expiry date: 2021-08-14). Please upload a valid passport.',admin_id,now()-interval'7 days',now()-interval'70 days'),
    (a12,'lohnsteuer',u12||'/'||a12||'/lohnsteuer/lohnsteuer_teodora.pdf','lohnsteuer_teodora.pdf',388096,'application/pdf','needs_reupload','Document is blurry and the income figures are not readable. Please upload a clear scan.',admin_id,now()-interval'6 days',now()-interval'68 days'),
    (a12,'payslip',u12||'/'||a12||'/payslip/payslips_teodora.pdf','payslips_teodora.pdf',512000,'application/pdf','approved',NULL,admin_id,now()-interval'6 days',now()-interval'67 days'),

    -- a13 Bojan (missing_documents) — mixed
    (a13,'passport',u13||'/'||a13||'/passport/pasosh_bojan.pdf','pasosh_bojan.pdf',325632,'application/pdf','approved',NULL,admin_id,now()-interval'20 days',now()-interval'78 days'),
    (a13,'lohnsteuer',u13||'/'||a13||'/lohnsteuer/lohnsteuer_bojan_2022.pdf','lohnsteuer_bojan_2022.pdf',462848,'application/pdf','approved',NULL,admin_id,now()-interval'19 days',now()-interval'76 days'),
    (a13,'bank_proof',u13||'/'||a13||'/bank_proof/bank_proof_bojan.pdf','bank_proof_bojan.pdf',198656,'application/pdf','rejected','The uploaded document does not show the IBAN. Please upload an official bank statement or a screenshot from online banking showing your full IBAN.',admin_id,now()-interval'9 days',now()-interval'74 days'),

    -- a14 Ana (ready_for_submission) — all approved
    (a14,'passport',u14||'/'||a14||'/passport/passport_ana.pdf','passport_ana.pdf',291840,'application/pdf','approved',NULL,admin_id,now()-interval'14 days',now()-interval'88 days'),
    (a14,'lohnsteuer',u14||'/'||a14||'/lohnsteuer/lohnsteuer_ana_2023.pdf','lohnsteuer_ana_2023.pdf',414720,'application/pdf','approved',NULL,admin_id,now()-interval'13 days',now()-interval'86 days'),
    (a14,'payslip',u14||'/'||a14||'/payslip/payslips_ana.pdf','payslips_ana.pdf',557056,'application/pdf','approved',NULL,admin_id,now()-interval'12 days',now()-interval'84 days'),
    (a14,'work_contract',u14||'/'||a14||'/work_contract/arbeitsvertrag_ana.pdf','arbeitsvertrag_ana.pdf',241664,'application/pdf','approved',NULL,admin_id,now()-interval'7 days',now()-interval'20 days'),

    -- a15 Kristijan (ready_for_submission) — all approved
    (a15,'passport',u15||'/'||a15||'/passport/passport_kristijan.pdf','passport_kristijan.pdf',309248,'application/pdf','approved',NULL,admin_id,now()-interval'22 days',now()-interval'96 days'),
    (a15,'lohnsteuer',u15||'/'||a15||'/lohnsteuer/lohnsteuer_kristijan.pdf','lohnsteuer_kristijan.pdf',428032,'application/pdf','approved',NULL,admin_id,now()-interval'21 days',now()-interval'94 days'),
    (a15,'payslip',u15||'/'||a15||'/payslip/payslips_2022.pdf','payslips_2022.pdf',585728,'application/pdf','approved',NULL,admin_id,now()-interval'20 days',now()-interval'92 days'),

    -- a16 Tatjana (submitted) — all approved
    (a16,'passport',u16||'/'||a16||'/passport/passport_tatjana.pdf','passport_tatjana.pdf',315392,'application/pdf','approved',NULL,admin_id,now()-interval'55 days',now()-interval'105 days'),
    (a16,'lohnsteuer',u16||'/'||a16||'/lohnsteuer/lohnsteuer_tatjana_2023.pdf','lohnsteuer_tatjana_2023.pdf',441344,'application/pdf','approved',NULL,admin_id,now()-interval'53 days',now()-interval'103 days'),
    (a16,'payslip',u16||'/'||a16||'/payslip/payslips_tatjana.pdf','payslips_tatjana.pdf',598016,'application/pdf','approved',NULL,admin_id,now()-interval'52 days',now()-interval'101 days'),

    -- a17 Dragan (submitted) — all approved
    (a17,'passport',u17||'/'||a17||'/passport/passport_dragan.pdf','passport_dragan.pdf',329728,'application/pdf','approved',NULL,admin_id,now()-interval'65 days',now()-interval'115 days'),
    (a17,'lohnsteuer',u17||'/'||a17||'/lohnsteuer/lohnsteuer_dragan_2022.pdf','lohnsteuer_dragan_2022.pdf',475136,'application/pdf','approved',NULL,admin_id,now()-interval'63 days',now()-interval'113 days'),
    (a17,'payslip',u17||'/'||a17||'/payslip/lohnabrechnungen_dragan.pdf','lohnabrechnungen_dragan.pdf',655360,'application/pdf','approved',NULL,admin_id,now()-interval'62 days',now()-interval'111 days'),
    (a17,'work_contract',u17||'/'||a17||'/work_contract/arbeitsvertrag_dragan.pdf','arbeitsvertrag_dragan.pdf',278528,'application/pdf','approved',NULL,admin_id,now()-interval'60 days',now()-interval'109 days'),

    -- a18 Vesna (completed) — all approved
    (a18,'passport',u18||'/'||a18||'/passport/passport_vesna.pdf','passport_vesna.pdf',307200,'application/pdf','approved',NULL,admin_id,now()-interval'88 days',now()-interval'130 days'),
    (a18,'lohnsteuer',u18||'/'||a18||'/lohnsteuer/lohnsteuer_vesna_2023.pdf','lohnsteuer_vesna_2023.pdf',435200,'application/pdf','approved',NULL,admin_id,now()-interval'86 days',now()-interval'128 days'),
    (a18,'payslip',u18||'/'||a18||'/payslip/payslips_vesna.pdf','payslips_vesna.pdf',573440,'application/pdf','approved',NULL,admin_id,now()-interval'85 days',now()-interval'126 days'),
    (a18,'bank_proof',u18||'/'||a18||'/bank_proof/bank_vesna.pdf','bank_vesna.pdf',208896,'application/pdf','approved',NULL,admin_id,now()-interval'84 days',now()-interval'124 days'),

    -- a19 Dejan (completed) — all approved
    (a19,'passport',u19||'/'||a19||'/passport/passport_dejan.pdf','passport_dejan.pdf',321536,'application/pdf','approved',NULL,admin_id,now()-interval'98 days',now()-interval'140 days'),
    (a19,'lohnsteuer',u19||'/'||a19||'/lohnsteuer/lohnsteuer_dejan_2022.pdf','lohnsteuer_dejan_2022.pdf',487424,'application/pdf','approved',NULL,admin_id,now()-interval'96 days',now()-interval'138 days'),
    (a19,'payslip',u19||'/'||a19||'/payslip/payslips_dejan.pdf','payslips_dejan.pdf',688128,'application/pdf','approved',NULL,admin_id,now()-interval'95 days',now()-interval'136 days'),
    (a19,'work_contract',u19||'/'||a19||'/work_contract/arbeitsvertrag_dejan.pdf','arbeitsvertrag_dejan.pdf',267264,'application/pdf','approved',NULL,admin_id,now()-interval'94 days',now()-interval'134 days'),
    (a19,'bank_proof',u19||'/'||a19||'/bank_proof/bank_dejan.pdf','bank_dejan.pdf',216064,'application/pdf','approved',NULL,admin_id,now()-interval'93 days',now()-interval'132 days'),

    -- a20 Risto (rejected) — mixed, missing key docs
    (a20,'passport',u20||'/'||a20||'/passport/passport_risto.pdf','passport_risto.pdf',296960,'application/pdf','approved',NULL,admin_id,now()-interval'60 days',now()-interval'92 days'),
    (a20,'lohnsteuer',u20||'/'||a20||'/lohnsteuer/lohnsteuer_risto_2022.pdf','lohnsteuer_risto_2022.pdf',391168,'application/pdf','rejected','Income shown (€5,200 for 5 months) is below the German tax threshold of €9,984 for 2022. Unfortunately a refund cannot be applied for.',admin_id,now()-interval'22 days',now()-interval'90 days');

  -- ─────────────────────────────────────────────────────────────
  -- 7. NOTES (messages & internal notes)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO notes (application_id, text, created_by, is_public, created_at) VALUES
    -- a06 Nikola — admin informs ready for payment
    (a06,'Hello Nikola, all your documents have been reviewed and approved! Your application is now ready for payment. Please proceed to pay the €70 service fee to continue.',admin_id,true,now()-interval'10 days'),
    (a06,'Thank you! I will pay today.',u06,true,now()-interval'9 days'),

    -- a07 Milica — ready for payment message
    (a07,'Hi Milica, good news — all documents have been verified and approved. Please make the service fee payment to proceed with your 2022 tax return.',admin_id,true,now()-interval'12 days'),

    -- a08 Arlind — paid, admin confirms
    (a08,'Hi Arlind, we have received your payment. Your 2023 tax return is now being processed. We will keep you updated.',admin_id,true,now()-interval'7 days'),
    (a08,'Great, thank you for the fast response!',u08,true,now()-interval'6 days'),
    (a08,'[INTERNAL] Payment received in cash at office. Amount: €70. Confirmed by agent.',admin_id,false,now()-interval'8 days'),

    -- a09 Blerta — paid
    (a09,'Hello Blerta, payment confirmed! We are starting preparation of your 2022 German tax return.',admin_id,true,now()-interval'10 days'),
    (a09,'Thank you so much! When can I expect results?',u09,true,now()-interval'9 days'),
    (a09,'The process typically takes 3–6 months after submission to the Finanzamt. We will notify you at each step.',admin_id,true,now()-interval'8 days'),

    -- a10 Georgi — in review
    (a10,'Hello Georgi, we have received your payment and started preparing your 2023 tax return. We will contact you if any clarification is needed.',admin_id,true,now()-interval'5 days'),
    (a10,'Understood, thank you. Please let me know if you need anything.',u10,true,now()-interval'4 days'),

    -- a11 Maria — in review
    (a11,'Hi Maria, your 2022 tax return is currently being prepared. Everything looks good so far.',admin_id,true,now()-interval'7 days'),

    -- a12 Teodora — documents rejected, auto-message + extra context
    (a12,'📄 Your **Passport / ID** has been flagged for reupload.

_Reason:_ Passport appears expired (expiry date: 2021-08-14). Please upload a valid passport.

Please visit the Documents page to take action.',admin_id,true,now()-interval'7 days'),
    (a12,'📄 Your **Lohnsteuerbescheinigung** has been flagged for reupload.

_Reason:_ Document is blurry and the income figures are not readable. Please upload a clear scan.

Please visit the Documents page to take action.',admin_id,true,now()-interval'6 days'),
    (a12,'I understand, I will upload new documents today. My passport was renewed last month.',u12,true,now()-interval'5 days'),
    (a12,'[INTERNAL] Called Teodora, she confirmed she has a new passport and will re-scan the Lohnsteuer. Follow up in 3 days.',admin_id,false,now()-interval'5 days'),

    -- a13 Bojan — bank proof rejected
    (a13,'📄 Your **Bank Details** has been rejected.

_Reason:_ The uploaded document does not show the IBAN. Please upload an official bank statement or a screenshot from online banking showing your full IBAN.

Please visit the Documents page to take action.',admin_id,true,now()-interval'9 days'),
    (a13,'Sorry, I uploaded the wrong document. I will send the correct one tomorrow.',u13,true,now()-interval'8 days'),
    (a13,'No problem, please make sure the full IBAN is visible on the document.',admin_id,true,now()-interval'7 days'),

    -- a14 Ana — work contract was re-uploaded, now ready for submission
    (a14,'Hi Ana, your application has been reviewed and all documents are approved! Your tax return has been prepared and is ready for submission to the Finanzamt.',admin_id,true,now()-interval'4 days'),
    (a14,'That is wonderful news! Thank you for your help.',u14,true,now()-interval'3 days'),

    -- a15 Kristijan — ready for submission
    (a15,'Hello Kristijan, your 2022 tax return is complete and ready for submission to the German tax office. We will file it within 24 hours.',admin_id,true,now()-interval'6 days'),
    (a15,'Perfect, I have been waiting for this. Thank you!',u15,true,now()-interval'5 days'),

    -- a16 Tatjana — submitted
    (a16,'Hi Tatjana, your 2023 tax return has been officially submitted to the Finanzamt München (Ref: FA-2024-MUC-081234). Processing typically takes 3–6 months. We will notify you when the refund is issued.',admin_id,true,now()-interval'25 days'),
    (a16,'Thank you! Is there anything else I need to do?',u16,true,now()-interval'24 days'),
    (a16,'Nothing from your side — just wait for the Finanzamt to process the return. We will follow up if they need anything.',admin_id,true,now()-interval'23 days'),

    -- a17 Dragan — submitted
    (a17,'Hi Dragan, your 2022 German tax return has been submitted to the Finanzamt Stuttgart. Reference number: FA-2023-STG-044567.',admin_id,true,now()-interval'30 days'),
    (a17,'Excellent! How long does it usually take?',u17,true,now()-interval'29 days'),
    (a17,'Typically 3 to 6 months. Some applications are processed faster. We will update you as soon as we receive any response.',admin_id,true,now()-interval'28 days'),

    -- a18 Vesna — completed
    (a18,'Great news Vesna! 🎉 The Finanzamt has processed your 2023 tax return and issued a refund of €874.50. The amount has been transferred to your registered bank account and should arrive within 3–5 business days.',admin_id,true,now()-interval'10 days'),
    (a18,'Oh wow, thank you so much! I was not expecting this much!',u18,true,now()-interval'9 days'),
    (a18,'You are very welcome! It was a pleasure working with you. Feel free to start a new application for tax year 2024 anytime.',admin_id,true,now()-interval'8 days'),

    -- a19 Dejan — completed
    (a19,'Congratulations Dejan! 🎉 Your 2022 German tax refund of €1,250.00 has been processed and transferred to your bank account.',admin_id,true,now()-interval'12 days'),
    (a19,'This is amazing! Thank you for the great service!',u19,true,now()-interval'11 days'),
    (a19,'Thank you for your kind words! We look forward to helping you again.',admin_id,true,now()-interval'10 days'),
    (a19,'[INTERNAL] High-value client, priority handling. Referred by Posrednik agency.',admin_id,false,now()-interval'140 days'),

    -- a20 Risto — rejected
    (a20,'Hi Risto, unfortunately after reviewing your 2022 documents, we have determined that your German income (€5,200 over 5 months) is below the annual tax threshold for 2022 (€9,984). This means no tax was withheld and no refund is applicable. We are sorry we could not help you this time.',admin_id,true,now()-interval'20 days'),
    (a20,'I see. That is unfortunate. Can I apply again if I work more next year?',u20,true,now()-interval'19 days'),
    (a20,'Absolutely! If you work in Germany for a full year or earn above the threshold, you should be eligible for a refund. You are welcome to apply again then.',admin_id,true,now()-interval'18 days');

  -- ─────────────────────────────────────────────────────────────
  -- 8. PAYMENTS (for paid/in_review/ready_for_submission/submitted/completed)
  -- ─────────────────────────────────────────────────────────────
  INSERT INTO payments (
    application_id, amount, currency, payment_type, status,
    stripe_payment_intent_id, paid_at, created_at
  ) VALUES
    (a08,70,'EUR','upfront','paid','MANUAL:CASH',now()-interval'8 days',now()-interval'8 days'),
    (a09,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKMnQ',now()-interval'10 days',now()-interval'10 days'),
    (a10,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKLMO',now()-interval'12 days',now()-interval'12 days'),
    (a11,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKPQR',now()-interval'14 days',now()-interval'14 days'),
    (a14,70,'EUR','upfront','paid','MANUAL:BANK_TRANSFER',now()-interval'6 days',now()-interval'6 days'),
    (a15,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKSTU',now()-interval'10 days',now()-interval'10 days'),
    (a16,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKVWX',now()-interval'42 days',now()-interval'42 days'),
    (a17,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKYZA',now()-interval'52 days',now()-interval'52 days'),
    (a18,70,'EUR','upfront','paid','pi_3OXY2kLkdIwHu7ix0vCXKBCD',now()-interval'78 days',now()-interval'78 days'),
    (a19,70,'EUR','upfront','paid','MANUAL:BANK_TRANSFER',now()-interval'88 days',now()-interval'88 days');

END $$;
