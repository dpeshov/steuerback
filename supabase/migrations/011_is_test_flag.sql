-- Add is_test flag to mark dummy/test data
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employments ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- Mark existing test users (created by seed scripts)
UPDATE users SET is_test = true
WHERE email IN (
  'ana.popovic@test.com',
  'marko.j@test.com',
  'stefan.petrov@test.com',
  'katarina.kovac@test.com'
);

-- Mark their applications
UPDATE applications SET is_test = true
WHERE user_id IN (SELECT id FROM users WHERE is_test = true);

-- Mark all seeded leads as test
UPDATE leads SET is_test = true;
