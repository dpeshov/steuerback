-- Add optional bank_address field to profiles
alter table profiles
  add column if not exists bank_address text;
