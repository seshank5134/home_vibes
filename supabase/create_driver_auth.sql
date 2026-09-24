-- ============================================================================
-- Create Driver Auth User & Fleet Record in Supabase
-- Run this in Supabase SQL Editor (Project: aymdlyhwqtgmaizwqotw)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- 1. Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'driver@homevibes.com' LIMIT 1;
  
  v_encrypted_pw := crypt('HomeVibes@2026', gen_salt('bf'));

  IF v_user_id IS NULL THEN
    -- Generate new UUID for the driver
    v_user_id := 'd2222222-bbbb-2222-bbbb-222222222222'::UUID;

    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'driver@homevibes.com',
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Ravi Kumar","role":"DRIVER"}',
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = now();
  ELSE
    -- Update existing password to HomeVibes@2026
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = now(),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 2. Upsert Profile
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    role
  ) VALUES (
    v_user_id,
    'Ravi Kumar (Speedy Driver)',
    'driver@homevibes.com',
    '+91-9876543211',
    'DRIVER'
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'DRIVER',
    name = EXCLUDED.name;

  -- 3. Upsert Driver Record
  INSERT INTO public.drivers (
    id,
    user_id,
    vehicle_type,
    vehicle_number,
    is_online,
    current_latitude,
    current_longitude,
    rating,
    total_deliveries
  ) VALUES (
    v_user_id,
    v_user_id,
    'Electric Scooter',
    'KA-01-HV-2026',
    true,
    12.9716,
    77.5946,
    4.96,
    48
  ) ON CONFLICT (user_id) DO UPDATE SET
    is_online = true,
    vehicle_number = EXCLUDED.vehicle_number;

  -- 4. Upsert Live Location for auto-assignment engine
  INSERT INTO public.driver_live_locations (
    driver_id,
    latitude,
    longitude,
    is_available,
    current_order_count,
    acceptance_rate
  ) VALUES (
    v_user_id,
    12.9716,
    77.5946,
    true,
    0,
    98.5
  ) ON CONFLICT (driver_id) DO UPDATE SET
    is_available = true,
    updated_at = now();

END$$;

SELECT 'Driver driver@homevibes.com created/updated with password HomeVibes@2026' AS status;
