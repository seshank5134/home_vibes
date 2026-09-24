-- ==============================================================================
-- HomeVibes — Cloud-Native Food Delivery Platform
-- Seed Users Script for Supabase SQL Editor
-- Creates 3 Pre-configured Test Accounts: Admin, Driver, and Customer
-- All passwords default to: HomeVibes@2026
-- ==============================================================================

DO $$
DECLARE
    admin_uid UUID := 'a1111111-aaaa-1111-aaaa-111111111111';
    driver_uid UUID := 'd2222222-bbbb-2222-bbbb-222222222222';
    customer_uid UUID := 'c3333333-cccc-3333-cccc-333333333333';
    encrypted_pw TEXT;
BEGIN
    encrypted_pw := crypt('HomeVibes@2026', gen_salt('bf'));

    -- 1. Insert Admin into auth.users (if not already exists)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@homevibes.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
            'admin@homevibes.com', encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Chef","role":"ADMIN","phone":"+919876543210"}',
            now(), now()
        );
    END IF;

    -- 2. Insert Driver into auth.users (if not already exists)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'driver@homevibes.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', driver_uid, 'authenticated', 'authenticated',
            'driver@homevibes.com', encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Ravi Kumar (Speedy Driver)","role":"DRIVER","phone":"+919876543211"}',
            now(), now()
        );
    END IF;

    -- 3. Insert Customer into auth.users (if not already exists)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'customer@homevibes.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', customer_uid, 'authenticated', 'authenticated',
            'customer@homevibes.com', encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Ananya Sharma","role":"CUSTOMER","phone":"+919876543212"}',
            now(), now()
        );
    END IF;

    -- Make sure driver is online and has vehicle details
    UPDATE public.drivers
    SET is_online = true,
        vehicle_type = 'Electric Scooter',
        vehicle_number = 'KA-01-HV-2026',
        current_latitude = 12.9716,
        current_longitude = 77.5946,
        last_location_update = now()
    WHERE user_id = driver_uid;

    -- Add a default address for the customer
    INSERT INTO public.addresses (user_id, label, address, latitude, longitude, is_default)
    VALUES (
        customer_uid,
        'Home (Indiranagar)',
        '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038',
        12.9784,
        77.6408,
        true
    ) ON CONFLICT DO NOTHING;

END $$;
