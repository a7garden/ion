-- Dev: Enable email/password login for testuser1 ~ testuser50
-- Password: test1234!
-- Uses pgcrypto to generate bcrypt hashes

-- First clean up any existing email identities for these users
DELETE FROM auth.identities
WHERE provider = 'email'
  AND user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ion.test');

-- Update auth.users with password and metadata
DO $$
DECLARE
    user_rec RECORD;
    pwhash TEXT;
BEGIN
    -- Generate consistent bcrypt hash for all test users
    pwhash := crypt('test1234!', gen_salt('bf', 10));

    FOR user_rec IN
        SELECT id, email FROM auth.users
        WHERE email LIKE 'testuser%@ion.test'
    LOOP
        UPDATE auth.users SET
            encrypted_password = pwhash,
            email_confirmed_at = now(),
            raw_app_meta_data = '{"provider":"email","providers":["email"]}',
            raw_user_meta_data = jsonb_build_object(
                'name', split_part(user_rec.email, '@', 1),
                'display_name', split_part(user_rec.email, '@', 1)
            ),
            aud = 'authenticated',
            role = 'authenticated',
            instance_id = '00000000-0000-0000-0000-000000000000',
            updated_at = now(),
            is_sso_user = false,
            is_anonymous = false
        WHERE id = user_rec.id;

        -- Insert email identity (provider_id = email for email auth)
        INSERT INTO auth.identities (
            provider_id, user_id, identity_data, provider,
            last_sign_in_at, created_at, updated_at
        ) VALUES (
            user_rec.email,
            user_rec.id,
            jsonb_build_object(
                'sub', user_rec.id::text,
                'email', user_rec.email
            ),
            'email',
            now(), now(), now()
        );
    END LOOP;
END $$;
