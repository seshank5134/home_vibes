-- ==============================================================================
-- HomeVibes — Fix Food Items RLS & Seed Dashboard Live Operations Data
-- File: supabase/fix_food_and_seed_dashboard.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aymdlyhwqtgmaizwqotw/sql/new
-- ==============================================================================

-- 1. ALLOW ADDING & EDITING MEAL KITS (Fixes "not able to add meal kit")
DROP POLICY IF EXISTS "Food items admin write" ON public.food_items;
CREATE POLICY "Food items admin write"
  ON public.food_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. DROP PROFILES FOREIGN KEY TO AUTH.USERS (Allows demo & guest profiles)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. ENSURE PROFILES RLS ALLOWS READ & INSERT
DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
CREATE POLICY "Profiles public read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles public insert" ON public.profiles;
CREATE POLICY "Profiles public insert" ON public.profiles FOR INSERT WITH CHECK (true);

-- 4. INSERT FLEET DRIVER PROFILES
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES 
  ('d2222222-bbbb-2222-bbbb-222222222222', 'Ravi Kumar (Speedy Driver)', 'ravi.driver@homevibes.com', '+91-9876543211', 'DRIVER'),
  ('d3333333-bbbb-3333-bbbb-333333333333', 'Amit Singh (Express Fleet)', 'amit.driver@homevibes.com', '+91-9876543212', 'DRIVER')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = 'DRIVER';

-- 5. INSERT ONLINE DRIVERS INTO DRIVERS TABLE
INSERT INTO public.drivers (id, user_id, vehicle_type, vehicle_number, is_online, current_latitude, current_longitude)
VALUES 
  ('d2222222-bbbb-2222-bbbb-222222222222', 'd2222222-bbbb-2222-bbbb-222222222222', 'Electric Scooter', 'KA-01-HV-2026', true, 12.9716, 77.5946),
  ('d3333333-bbbb-3333-bbbb-333333333333', 'd3333333-bbbb-3333-bbbb-333333333333', 'Honda Activa EV', 'KA-04-HV-1088', true, 12.9784, 77.6408)
ON CONFLICT (id) DO UPDATE SET is_online = true;

-- 6. INSERT CUSTOMER PROFILES
INSERT INTO public.profiles (id, name, email, phone, role)
VALUES 
  ('c3333333-cccc-3333-cccc-333333333333', 'Ananya Sharma', 'ananya.s@gmail.com', '+91-9876543210', 'CUSTOMER'),
  ('c4444444-cccc-4444-cccc-444444444444', 'Vikram Reddy', 'vikram.r@gmail.com', '+91-9876543214', 'CUSTOMER'),
  ('c5555555-cccc-5555-cccc-555555555555', 'Priya Nair', 'priya.nair@gmail.com', '+91-9876543215', 'CUSTOMER'),
  ('c6666666-cccc-6666-cccc-666666666666', 'Rohan Mehta', 'rohan.mehta@gmail.com', '+91-9876543216', 'CUSTOMER'),
  ('c7777777-cccc-7777-cccc-777777777777', 'Kavya Patel', 'kavya.patel@gmail.com', '+91-9876543217', 'CUSTOMER'),
  ('a1111111-aaaa-1111-aaaa-111111111111', 'Seshank Admin', 'seshank5134@gmail.com', '+91-9876543210', 'ADMIN')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 7. SEED DELIVERED ORDERS FOR REVENUE (Total Revenue ~₹18,450)
-- Note: id is omitted so PostgreSQL automatically generates valid UUIDs via gen_random_uuid()
INSERT INTO public.orders (
  order_number, customer_id, driver_id, status, subtotal, delivery_fee, total_amount, delivery_address, delivery_latitude, delivery_longitude, payment_method, payment_status, delivery_notes, created_at
) VALUES 
  ('HV-712891', 'c4444444-cccc-4444-cccc-444444444444', 'd2222222-bbbb-2222-bbbb-222222222222', 'DELIVERED', 4200.00, 40.00, 4240.00, 'Koramangala 4th Block, Bengaluru', 12.9352, 77.6245, 'UPI', 'PAID', 'Leave with security', now() - interval '2 days'),
  ('HV-829103', 'c5555555-cccc-5555-cccc-555555555555', 'd3333333-bbbb-3333-bbbb-333333333333', 'DELIVERED', 5100.00, 40.00, 5140.00, 'HSR Layout Sector 2, Bengaluru', 12.9121, 77.6446, 'ONLINE_MOCK', 'PAID', 'Call on arrival', now() - interval '1 day'),
  ('HV-940124', 'c6666666-cccc-6666-cccc-666666666666', 'd2222222-bbbb-2222-bbbb-222222222222', 'DELIVERED', 4500.00, 40.00, 4540.00, 'Indiranagar 100ft Road, Bengaluru', 12.9716, 77.5946, 'UPI', 'PAID', 'Do not ring bell', now() - interval '18 hours'),
  ('HV-384719', 'c7777777-cccc-7777-cccc-777777777777', 'd3333333-bbbb-3333-bbbb-333333333333', 'DELIVERED', 4490.00, 40.00, 4530.00, 'Whitefield Main Road, Bengaluru', 12.9698, 77.7500, 'UPI', 'PAID', 'Fresh ingredients packed nicely', now() - interval '6 hours')
ON CONFLICT (order_number) DO NOTHING;

-- 8. SEED ACTIVE DISPATCH ORDERS
INSERT INTO public.orders (
  order_number, customer_id, driver_id, status, subtotal, delivery_fee, total_amount, delivery_address, delivery_latitude, delivery_longitude, payment_method, payment_status, delivery_notes, created_at
) VALUES 
  ('HV-648201', 'c3333333-cccc-3333-cccc-333333333333', 'd2222222-bbbb-2222-bbbb-222222222222', 'PREPARING', 698.00, 40.00, 738.00, '100 Feet Road, HAL 2nd Stage, Indiranagar', 12.9784, 77.6408, 'UPI', 'PAID', 'Extra mint leaves requested', now() - interval '25 minutes'),
  ('HV-519284', 'c4444444-cccc-4444-cccc-444444444444', 'd3333333-bbbb-3333-bbbb-333333333333', 'OUT_FOR_DELIVERY', 548.00, 40.00, 588.00, 'MG Road Metro Station Area, Bengaluru', 12.9756, 77.6066, 'CASH_ON_DELIVERY', 'PENDING', 'Gate code 4022', now() - interval '10 minutes')
ON CONFLICT (order_number) DO NOTHING;

-- 9. VERIFICATION
SELECT 
  (SELECT count(*) FROM public.orders) as total_orders,
  (SELECT coalesce(sum(total_amount), 0) FROM public.orders WHERE status = 'DELIVERED') as total_revenue,
  (SELECT count(*) FROM public.orders WHERE status NOT IN ('DELIVERED', 'CANCELLED')) as active_orders,
  (SELECT count(*) FROM public.drivers WHERE is_online = true) as online_drivers,
  (SELECT count(*) FROM public.profiles WHERE role = 'CUSTOMER') as registered_customers;
