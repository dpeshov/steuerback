-- Employments table: multiple employment records per user
CREATE TABLE IF NOT EXISTS employments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  city TEXT,
  work_start DATE,
  work_end DATE,
  gross_income_eur NUMERIC,
  tax_year INTEGER,
  student_status BOOLEAN DEFAULT false,
  university TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE employments ENABLE ROW LEVEL SECURITY;

-- Users can manage their own employments
CREATE POLICY "Users can read own employments"
  ON employments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employments"
  ON employments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employments"
  ON employments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own employments"
  ON employments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all employments
CREATE POLICY "Admins can read all employments"
  ON employments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE INDEX idx_employments_user_id ON employments(user_id);
CREATE INDEX idx_employments_tax_year ON employments(tax_year);
