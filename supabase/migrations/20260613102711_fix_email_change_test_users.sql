-- Fix email_change column for GoTrue
UPDATE auth.users SET
  email_change = COALESCE(email_change, ''),
  is_super_admin = COALESCE(is_super_admin, false)
WHERE email LIKE 'testuser%@ion.test';
