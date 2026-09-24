-- ==============================================================================
-- HomeVibes — Grant Admin Privileges to Seshank
-- File: supabase/make_seshank_admin.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aymdlyhwqtgmaizwqotw/sql
-- ==============================================================================

-- 1. If profile already exists for seshank5134@gmail.com, upgrade role to 'ADMIN'
UPDATE public.profiles
SET role = 'ADMIN',
    name = COALESCE(name, 'Seshank')
WHERE lower(email) = 'seshank5134@gmail.com';

-- 2. Update the automated signup trigger so seshank5134@gmail.com is ALWAYS granted ADMIN role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role VARCHAR(20);
    user_name VARCHAR(255);
BEGIN
    -- Check if user is primary administrator
    IF lower(NEW.email) = 'seshank5134@gmail.com' THEN
        user_role := 'ADMIN';
        user_name := 'Seshank';
    ELSE
        user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER');
        user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    END IF;

    INSERT INTO public.profiles (id, name, email, phone, role)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        role = EXCLUDED.role;

    IF user_role = 'DRIVER' THEN
        INSERT INTO public.drivers (user_id, is_online)
        VALUES (NEW.id, true)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification Query: Check current admin accounts
SELECT id, name, email, role, created_at 
FROM public.profiles 
WHERE role = 'ADMIN' OR lower(email) = 'seshank5134@gmail.com';
