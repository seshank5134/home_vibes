-- ============================================================================
-- HomeVibes: Smart Tracking & Auto-Assignment Migration
-- Run this in Supabase SQL Editor (Project: aymdlyhwqtgmaizwqotw)
-- ============================================================================

-- 1. ORDER TRACKING EVENTS
-- Every status change is logged here for the customer timeline
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL,
  status          TEXT NOT NULL,
  message         TEXT,
  driver_lat      DECIMAL(10,7),
  driver_lng      DECIMAL(10,7),
  actor           TEXT DEFAULT 'SYSTEM',  -- SYSTEM | DRIVER | ADMIN
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_created ON order_tracking_events(created_at DESC);

-- 2. DELIVERY ASSIGNMENTS
-- One record per assignment attempt (multiple attempts until accepted)
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL,
  driver_id       UUID NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','ACCEPTED','REJECTED','TIMEOUT','CANCELLED')),
  attempt_number  INT NOT NULL DEFAULT 1,
  distance_km     DECIMAL(6,2),       -- driver to kitchen distance at time of assignment
  is_batch        BOOLEAN DEFAULT FALSE,
  batch_order_ids UUID[],             -- other order IDs in this delivery batch
  assigned_at     TIMESTAMPTZ DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '3 minutes')
);

CREATE INDEX IF NOT EXISTS idx_assignments_order ON delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver ON delivery_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON delivery_assignments(status);

-- 3. DRIVER LIVE LOCATIONS (upsert table — 1 row per driver)
CREATE TABLE IF NOT EXISTS driver_live_locations (
  driver_id       UUID PRIMARY KEY,
  latitude        DECIMAL(10,7) NOT NULL,
  longitude       DECIMAL(10,7) NOT NULL,
  heading         DECIMAL(5,2) DEFAULT 0,
  speed_kmh       DECIMAL(5,2) DEFAULT 0,
  is_available    BOOLEAN DEFAULT TRUE,
  current_order_count INT DEFAULT 0,   -- 0-3 (max 3 batched orders)
  acceptance_rate DECIMAL(5,2) DEFAULT 100.0,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 4. ADD COLUMNS TO orders TABLE (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='driver_id') THEN
    ALTER TABLE orders ADD COLUMN driver_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='tracking_code') THEN
    ALTER TABLE orders ADD COLUMN tracking_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='estimated_delivery_at') THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='assignment_status') THEN
    ALTER TABLE orders ADD COLUMN assignment_status TEXT DEFAULT 'UNASSIGNED'
      CHECK (assignment_status IN ('UNASSIGNED','PENDING','ASSIGNED','FAILED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='is_batch') THEN
    ALTER TABLE orders ADD COLUMN is_batch BOOLEAN DEFAULT FALSE;
  END IF;

  -- Ensure payment_method accepts all supported online and offline payment options
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
  ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method IN ('UPI', 'CARD', 'NETBANKING', 'CASH_ON_DELIVERY', 'COD', 'ONLINE_MOCK', 'Card', 'NetBanking'));
END$$;

-- Auto-generate tracking codes on insert
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := 'HVT-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tracking_code ON orders;
CREATE TRIGGER trg_tracking_code
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_tracking_code();

-- ============================================================================
-- 5. AUTO-LOG TRACKING EVENTS on order status change
-- ============================================================================
CREATE OR REPLACE FUNCTION log_order_tracking_event()
RETURNS TRIGGER AS $$
DECLARE
  v_message TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_message := CASE NEW.status
      WHEN 'PLACED'           THEN 'Your order has been placed successfully!'
      WHEN 'CONFIRMED'        THEN 'HomeVibes kitchen confirmed your order'
      WHEN 'PREPARING'        THEN 'Our chefs are preparing your fresh meal'
      WHEN 'READY_FOR_PICKUP' THEN 'Your order is packed and ready for pickup'
      WHEN 'DRIVER_ASSIGNED'  THEN 'A delivery partner has been assigned'
      WHEN 'PICKED_UP'        THEN 'Your order has been picked up by the driver'
      WHEN 'OUT_FOR_DELIVERY' THEN 'Your order is on its way to you!'
      WHEN 'DELIVERED'        THEN 'Order delivered! Enjoy your meal.'
      WHEN 'CANCELLED'        THEN 'Your order has been cancelled'
      ELSE 'Order status updated to ' || NEW.status
    END;

    INSERT INTO order_tracking_events (order_id, status, message, actor)
    VALUES (NEW.id, NEW.status, v_message, 'SYSTEM');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_tracking ON orders;
CREATE TRIGGER trg_log_tracking
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_tracking_event();

-- Also log PLACED on INSERT
CREATE OR REPLACE FUNCTION log_order_placed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_tracking_events (order_id, status, message, actor)
  VALUES (NEW.id, 'PLACED', 'Your order has been placed successfully!', 'SYSTEM');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_placed ON orders;
CREATE TRIGGER trg_log_placed
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_placed();

-- ============================================================================
-- 6. AUTO-ASSIGN ENGINE FUNCTION
-- Scores available drivers and creates assignment record
-- Score = (1/distance_km) * availability_factor * acceptance_rate
-- Delivery sharing: checks if driver has nearby in-progress orders (within 3km)
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_assign_driver(p_order_id UUID)
RETURNS TABLE (
  assigned        BOOLEAN,
  driver_id       UUID,
  distance_km     DECIMAL,
  is_batch        BOOLEAN,
  message         TEXT
) AS $$
DECLARE
  v_order         RECORD;
  v_driver        RECORD;
  v_best_driver   UUID;
  v_best_distance DECIMAL := 9999;
  v_best_score    DECIMAL := 0;
  v_is_batch      BOOLEAN := FALSE;
  v_batch_ids     UUID[];
  v_assignment_id UUID;
  KITCHEN_LAT     DECIMAL := 12.9716;  -- HomeVibes Central Kitchen
  KITCHEN_LNG     DECIMAL := 77.5946;
  MAX_RADIUS_KM   DECIMAL := 15.0;
  MAX_BATCH_ORDERS INT := 3;
BEGIN
  -- Fetch the order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, FALSE, 'Order not found';
    RETURN;
  END IF;

  -- Find best driver using Haversine approximation
  FOR v_driver IN
    SELECT
      dll.driver_id,
      dll.latitude,
      dll.longitude,
      dll.is_available,
      dll.current_order_count,
      dll.acceptance_rate,
      -- Distance from driver to kitchen (km)
      (6371 * acos(
        LEAST(1.0, cos(radians(KITCHEN_LAT)) * cos(radians(dll.latitude))
        * cos(radians(dll.longitude) - radians(KITCHEN_LNG))
        + sin(radians(KITCHEN_LAT)) * sin(radians(dll.latitude)))
      )) AS dist_to_kitchen,
      -- Distance from driver's current delivery endpoint to new delivery point (for batch check)
      COALESCE((
        SELECT 6371 * acos(
          LEAST(1.0, cos(radians(v_order.delivery_latitude))
          * cos(radians(o2.delivery_latitude))
          * cos(radians(o2.delivery_longitude) - radians(v_order.delivery_longitude))
          + sin(radians(v_order.delivery_latitude)) * sin(radians(o2.delivery_latitude)))
        )
        FROM orders o2
        WHERE o2.driver_id = dll.driver_id
          AND o2.status NOT IN ('DELIVERED','CANCELLED')
        ORDER BY o2.created_at DESC
        LIMIT 1
      ), 9999) AS dist_to_last_stop
    FROM driver_live_locations dll
    WHERE dll.is_available = TRUE
      AND dll.current_order_count < MAX_BATCH_ORDERS
  LOOP
    -- Skip drivers beyond 15km radius from kitchen
    CONTINUE WHEN v_driver.dist_to_kitchen > MAX_RADIUS_KM;

    DECLARE
      v_score DECIMAL;
      v_avail_factor DECIMAL;
    BEGIN
      -- Availability factor: prefer less loaded drivers
      v_avail_factor := 1.0 - (v_driver.current_order_count::DECIMAL / MAX_BATCH_ORDERS);

      -- Score formula: higher = better
      v_score := (1.0 / GREATEST(v_driver.dist_to_kitchen, 0.1))
               * v_avail_factor
               * (v_driver.acceptance_rate / 100.0);

      -- Bonus score if delivery point is near driver's existing route (batch candidate)
      IF v_driver.dist_to_last_stop < 3.0 AND v_driver.current_order_count > 0 THEN
        v_score := v_score * 1.5;  -- 50% bonus for batching efficiency
      END IF;

      IF v_score > v_best_score THEN
        v_best_score    := v_score;
        v_best_driver   := v_driver.driver_id;
        v_best_distance := v_driver.dist_to_kitchen;
        v_is_batch      := (v_driver.dist_to_last_stop < 3.0 AND v_driver.current_order_count > 0);
      END IF;
    END;
  END LOOP;

  -- No driver found
  IF v_best_driver IS NULL THEN
    UPDATE orders SET assignment_status = 'FAILED' WHERE id = p_order_id;
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, FALSE, 'No available drivers within 15km';
    RETURN;
  END IF;

  -- Get batch order IDs if applicable
  IF v_is_batch THEN
    SELECT ARRAY_AGG(id) INTO v_batch_ids
    FROM orders
    WHERE driver_id = v_best_driver
      AND status NOT IN ('DELIVERED','CANCELLED');
  END IF;

  -- Create assignment record
  INSERT INTO delivery_assignments (
    order_id, driver_id, status, distance_km, is_batch, batch_order_ids
  ) VALUES (
    p_order_id, v_best_driver, 'PENDING', v_best_distance, v_is_batch, v_batch_ids
  ) RETURNING id INTO v_assignment_id;

  -- Mark order as pending assignment
  UPDATE orders
  SET assignment_status = 'PENDING',
      estimated_delivery_at = now() + INTERVAL '35 minutes'
  WHERE id = p_order_id;

  -- Increment driver's order count (provisionally)
  UPDATE driver_live_locations
  SET current_order_count = current_order_count + 1,
      updated_at = now()
  WHERE driver_id = v_best_driver;

  RETURN QUERY SELECT TRUE, v_best_driver, v_best_distance, v_is_batch,
    CASE WHEN v_is_batch
      THEN 'Assigned to driver (batch delivery)'
      ELSE 'Assigned to best available driver'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. DRIVER RESPONDS TO ASSIGNMENT
-- ============================================================================
CREATE OR REPLACE FUNCTION respond_to_assignment(
  p_assignment_id UUID,
  p_driver_id     UUID,
  p_accept        BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_assignment RECORD;
  v_new_status TEXT;
BEGIN
  SELECT * INTO v_assignment FROM delivery_assignments
  WHERE id = p_assignment_id AND driver_id = p_driver_id AND status = 'PENDING';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Assignment not found or already responded');
  END IF;

  -- Check if expired
  IF now() > v_assignment.expires_at THEN
    UPDATE delivery_assignments SET status = 'TIMEOUT', responded_at = now()
    WHERE id = p_assignment_id;
    -- Decrement driver order count back
    UPDATE driver_live_locations
    SET current_order_count = GREATEST(0, current_order_count - 1)
    WHERE driver_id = p_driver_id;
    RETURN jsonb_build_object('success', false, 'error', 'Assignment expired');
  END IF;

  IF p_accept THEN
    -- Accept: update assignment + order
    UPDATE delivery_assignments
    SET status = 'ACCEPTED', responded_at = now()
    WHERE id = p_assignment_id;

    UPDATE orders
    SET driver_id = p_driver_id,
        status = 'DRIVER_ASSIGNED',
        assignment_status = 'ASSIGNED'
    WHERE id = v_assignment.order_id;

    -- Update driver acceptance rate (exponential moving average)
    UPDATE driver_live_locations
    SET acceptance_rate = LEAST(100, acceptance_rate * 0.9 + 100 * 0.1),
        updated_at = now()
    WHERE driver_id = p_driver_id;

    RETURN jsonb_build_object('success', true, 'status', 'ACCEPTED', 'order_id', v_assignment.order_id);
  ELSE
    -- Decline: update assignment, free up driver slot, retry with next driver
    UPDATE delivery_assignments
    SET status = 'REJECTED', responded_at = now()
    WHERE id = p_assignment_id;

    -- Penalize acceptance rate slightly
    UPDATE driver_live_locations
    SET acceptance_rate = GREATEST(0, acceptance_rate * 0.9 + 0 * 0.1),
        current_order_count = GREATEST(0, current_order_count - 1),
        updated_at = now()
    WHERE driver_id = p_driver_id;

    -- Trigger re-assignment (next best driver)
    PERFORM auto_assign_driver(v_assignment.order_id);

    RETURN jsonb_build_object('success', true, 'status', 'REJECTED', 'reassigning', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_live_locations ENABLE ROW LEVEL SECURITY;

-- Tracking events: public read (customers need to see their order events)
DROP POLICY IF EXISTS "tracking_read_all" ON order_tracking_events;
CREATE POLICY "tracking_read_all"
  ON order_tracking_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "tracking_insert_system" ON order_tracking_events;
CREATE POLICY "tracking_insert_system"
  ON order_tracking_events FOR INSERT WITH CHECK (true);

-- Assignments: drivers and admins
DROP POLICY IF EXISTS "assignments_read" ON delivery_assignments;
CREATE POLICY "assignments_read"
  ON delivery_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "assignments_write" ON delivery_assignments;
CREATE POLICY "assignments_write"
  ON delivery_assignments FOR ALL USING (true);

-- Driver live locations: drivers can upsert their own; all can read
DROP POLICY IF EXISTS "driver_loc_read" ON driver_live_locations;
CREATE POLICY "driver_loc_read"
  ON driver_live_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "driver_loc_write" ON driver_live_locations;
CREATE POLICY "driver_loc_write"
  ON driver_live_locations FOR ALL USING (true);

-- ============================================================================
-- 9. ENABLE REALTIME on key tables
-- ============================================================================
DO $$
BEGIN
  PERFORM pg_catalog.set_config('search_path', 'public', false);
  -- These are run via Supabase dashboard Realtime settings
  -- Tables to enable: orders, order_tracking_events, driver_live_locations, delivery_assignments
  RAISE NOTICE 'Enable Realtime in Supabase Dashboard for: orders, order_tracking_events, driver_live_locations, delivery_assignments';
END$$;

-- ============================================================================
-- 10. SEED: Insert sample tracking events for existing demo orders
-- ============================================================================
DO $$
DECLARE
  v_order_id UUID;
BEGIN
  FOR v_order_id IN
    SELECT id FROM orders WHERE status IN ('DELIVERED','OUT_FOR_DELIVERY','PREPARING')
    LIMIT 5
  LOOP
    -- Don't duplicate if already has events
    CONTINUE WHEN EXISTS (SELECT 1 FROM order_tracking_events WHERE order_id = v_order_id);

    INSERT INTO order_tracking_events (order_id, status, message, created_at) VALUES
      (v_order_id, 'PLACED',           'Order placed successfully',                  now() - INTERVAL '45 min'),
      (v_order_id, 'CONFIRMED',        'HomeVibes kitchen confirmed your order',      now() - INTERVAL '42 min'),
      (v_order_id, 'PREPARING',        'Our chefs are preparing your fresh meal',    now() - INTERVAL '35 min'),
      (v_order_id, 'READY_FOR_PICKUP', 'Order is packed and ready for pickup',       now() - INTERVAL '20 min'),
      (v_order_id, 'DRIVER_ASSIGNED',  'A delivery partner has been assigned',       now() - INTERVAL '18 min'),
      (v_order_id, 'PICKED_UP',        'Your order has been picked up by the driver',now() - INTERVAL '15 min'),
      (v_order_id, 'OUT_FOR_DELIVERY', 'Your order is on its way!',                  now() - INTERVAL '10 min');
  END LOOP;
END$$;

-- Seed driver live locations for demo drivers
INSERT INTO driver_live_locations (driver_id, latitude, longitude, is_available, current_order_count, acceptance_rate)
VALUES
  ('d2222222-bbbb-2222-bbbb-222222222222', 12.9716, 77.5946, TRUE, 0, 96.5),
  ('d3333333-cccc-3333-cccc-333333333333', 12.9352, 77.6245, TRUE, 1, 89.2),
  ('d4444444-dddd-4444-dddd-444444444444', 12.9784, 77.6408, FALSE, 0, 92.0)
ON CONFLICT (driver_id) DO UPDATE
  SET is_available = EXCLUDED.is_available,
      acceptance_rate = EXCLUDED.acceptance_rate,
      updated_at = now();

SELECT 'Migration complete: tracking_and_assignment.sql applied successfully' AS result;
