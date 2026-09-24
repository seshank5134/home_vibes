-- ============================================================================
-- HomeVibes: Add Relational Foreign Keys & Visualizer Connections
-- Run this in Supabase SQL Editor (Project: aymdlyhwqtgmaizwqotw)
-- This connects order_tracking_events, delivery_assignments, and driver_live_locations
-- to orders and drivers so relationship lines appear in the Supabase Schema Visualizer!
-- ============================================================================

BEGIN;

-- 1. Ensure orders status check constraint includes all lifecycle statuses
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE IF EXISTS public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'DRIVER_ASSIGNED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ));

-- 2. Clean up any invalid or orphaned demo rows before applying constraints
DELETE FROM public.order_tracking_events 
  WHERE order_id NOT IN (SELECT id FROM public.orders);

DELETE FROM public.delivery_assignments 
  WHERE order_id NOT IN (SELECT id FROM public.orders);

DELETE FROM public.delivery_assignments 
  WHERE driver_id NOT IN (SELECT id FROM public.drivers);

DELETE FROM public.driver_live_locations 
  WHERE driver_id NOT IN (SELECT id FROM public.drivers);

-- 3. Add Foreign Key: order_tracking_events -> orders
ALTER TABLE IF EXISTS public.order_tracking_events 
  DROP CONSTRAINT IF EXISTS fk_tracking_order;

ALTER TABLE IF EXISTS public.order_tracking_events 
  ADD CONSTRAINT fk_tracking_order 
  FOREIGN KEY (order_id) 
  REFERENCES public.orders(id) 
  ON DELETE CASCADE;

-- 4. Add Foreign Key: delivery_assignments -> orders & drivers
ALTER TABLE IF EXISTS public.delivery_assignments 
  DROP CONSTRAINT IF EXISTS fk_assignment_order;

ALTER TABLE IF EXISTS public.delivery_assignments 
  ADD CONSTRAINT fk_assignment_order 
  FOREIGN KEY (order_id) 
  REFERENCES public.orders(id) 
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.delivery_assignments 
  DROP CONSTRAINT IF EXISTS fk_assignment_driver;

ALTER TABLE IF EXISTS public.delivery_assignments 
  ADD CONSTRAINT fk_assignment_driver 
  FOREIGN KEY (driver_id) 
  REFERENCES public.drivers(id) 
  ON DELETE CASCADE;

-- 5. Add Foreign Key: driver_live_locations -> drivers
ALTER TABLE IF EXISTS public.driver_live_locations 
  DROP CONSTRAINT IF EXISTS fk_live_location_driver;

ALTER TABLE IF EXISTS public.driver_live_locations 
  ADD CONSTRAINT fk_live_location_driver 
  FOREIGN KEY (driver_id) 
  REFERENCES public.drivers(id) 
  ON DELETE CASCADE;

COMMIT;

SELECT 'Success: Foreign keys applied! Check your Supabase Schema Visualizer now to see all relational lines.' AS migration_status;
