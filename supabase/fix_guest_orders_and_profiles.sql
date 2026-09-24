-- ==============================================================================
-- HomeVibes — Fix Guest Orders & Profiles Schema Constraint
-- File: supabase/fix_guest_orders_and_profiles.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aymdlyhwqtgmaizwqotw/sql/new
-- ==============================================================================

-- 1. Remove the strict foreign key between public.profiles and auth.users
-- This allows guest profiles, demo profiles, and seeded profiles to exist safely
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Make customer_id nullable on orders so anonymous / guest orders never fail
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;

-- 3. Modify orders -> profiles foreign key constraint to ON DELETE SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Insert or update the Guest Customer profile in profiles table
-- Note: role MUST be uppercase 'CUSTOMER' to satisfy profiles_role_check
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES (
  'c3333333-cccc-3333-cccc-333333333333',
  'Guest Customer',
  'guest@homevibes.app',
  '+91-9876543210',
  'CUSTOMER'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'CUSTOMER';

-- 5. Insert Seshank Admin profile
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES (
  'a1111111-aaaa-1111-aaaa-111111111111',
  'Seshank Admin',
  'seshank5134@gmail.com',
  '+91-9876543210',
  'ADMIN'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'ADMIN';

-- 6. Insert Driver profile for deliveries
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES (
  'd2222222-bbbb-2222-bbbb-222222222222',
  'Ravi Kumar (Speedy Driver)',
  'driver@homevibes.com',
  '+91-9876543211',
  'DRIVER'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'DRIVER';

-- 7. Insert driver record if drivers table exists
INSERT INTO public.drivers (id, user_id, vehicle_type, vehicle_number, is_online, current_latitude, current_longitude)
VALUES (
  'd2222222-bbbb-2222-bbbb-222222222222',
  'd2222222-bbbb-2222-bbbb-222222222222',
  'Electric Scooter',
  'KA-01-HV-2026',
  true,
  12.9716,
  77.5946
)
ON CONFLICT (id) DO UPDATE SET
  is_online = true;

-- 8. Test insert an order to verify it works directly in PostgreSQL
INSERT INTO public.orders (
  order_number, customer_id, status,
  subtotal, delivery_fee, total_amount,
  delivery_address, delivery_latitude, delivery_longitude,
  payment_method, payment_status, delivery_notes
) VALUES (
  'HV-TEST-SUCCESS', 'c3333333-cccc-3333-cccc-333333333333',
  'PLACED', 299.00, 40.00, 339.00,
  'Indiranagar, Bengaluru', 12.9716000, 77.5946000,
  'UPI', 'PENDING', 'Database verification order'
)
ON CONFLICT (order_number) DO NOTHING;

-- 9. Check results
SELECT id, order_number, customer_id, status, total_amount, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
