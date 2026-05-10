-- ============================================================
-- SteuerBack — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Users table (mirrors auth.users with role)
CREATE TABLE IF NOT EXISTS public.users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text UNIQUE NOT NULL,
  role            text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at      timestamptz DEFAULT now(),
  last_login_at   timestamptz,
  is_active       boolean DEFAULT true
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  first_name            text,
  last_name             text,
  date_of_birth         date,
  nationality           text,
  phone                 text,
  country_of_residence  text,
  city                  text,
  address               text,
  preferred_language    text DEFAULT 'en',
  passport_number       text,
  document_type         text CHECK (document_type IN ('passport', 'national_id')),
  issuing_country       text,
  document_expiry       date,
  tax_id                text,
  student_status        boolean,
  university            text,
  employer_name         text,
  work_start            date,
  work_end              date,
  gross_income_eur      numeric,
  bank_name             text,
  iban                  text,
  swift_bic             text,
  bank_account_holder   text,
  bank_country          text,
  profile_complete      boolean DEFAULT false,
  updated_at            timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.users(id) ON DELETE CASCADE,
  tax_year        integer CHECK (tax_year BETWEEN 2019 AND 2026),
  country         text DEFAULT 'DE',
  status          text DEFAULT 'draft' CHECK (status IN (
    'draft','profile_incomplete','documents_pending','ready_for_payment',
    'paid','in_review','missing_documents','ready_for_submission',
    'submitted','completed','rejected'
  )),
  payment_status  text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded')),
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  submitted_at    timestamptz,
  completed_at    timestamptz,
  UNIQUE(user_id, tax_year)
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type   text CHECK (document_type IN (
    'passport','lohnsteuer','payslip','student_proof',
    'home_tax_statement','power_of_attorney','bank_proof','work_contract'
  )),
  file_path       text NOT NULL,
  file_name       text NOT NULL,
  file_size       integer,
  mime_type       text,
  review_status   text DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','needs_reupload')),
  admin_note      text,
  reviewed_by     uuid REFERENCES public.users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  amount                      numeric NOT NULL,
  currency                    text DEFAULT 'EUR',
  payment_type                text CHECK (payment_type IN ('upfront','deferred')),
  status                      text DEFAULT 'unpaid' CHECK (status IN ('unpaid','pending','paid','failed','refunded')),
  stripe_payment_intent_id    text,
  stripe_checkout_session_id  text,
  paid_at                     timestamptz,
  created_at                  timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  text            text NOT NULL,
  created_by      uuid REFERENCES public.users(id),
  is_public       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Status logs
CREATE TABLE IF NOT EXISTS public.status_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status      text,
  new_status      text NOT NULL,
  changed_by      uuid REFERENCES public.users(id),
  reason          text,
  created_at      timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- AUTO-CREATE USER RECORD ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users: can read own record
CREATE POLICY "users_read_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profiles: own only
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Applications: own only
CREATE POLICY "applications_read_own" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "applications_insert_own" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications_update_own" ON public.applications FOR UPDATE USING (auth.uid() = user_id);

-- Documents: own via application
CREATE POLICY "documents_read_own" ON public.documents FOR SELECT
  USING (application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid()));
CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT
  WITH CHECK (application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid()));

-- Payments: own via application
CREATE POLICY "payments_read_own" ON public.payments FOR SELECT
  USING (application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid()));

-- Notes: only public notes visible to user
CREATE POLICY "notes_read_public" ON public.notes FOR SELECT
  USING (
    is_public = true AND
    application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
  );

-- Status logs: own via application
CREATE POLICY "status_logs_read_own" ON public.status_logs FOR SELECT
  USING (application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid()));

-- Notifications: own only
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
