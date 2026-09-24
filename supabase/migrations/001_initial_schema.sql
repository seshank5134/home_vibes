-- ==============================================================================
-- HomeVibes — Cloud-Native Food Delivery Platform
-- Migration 001: Initial Relational Database Schema
-- Target Engine: PostgreSQL 15+ (Supabase)
-- Currency: Indian Rupee (INR - ₹)
-- Model: Fresh Indian Meal Kits & Raw Materials with Step-by-Step Cooking Scripts
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked with Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' 
        CHECK (role IN ('CUSTOMER', 'DRIVER', 'ADMIN')),
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. FOOD ITEMS / MEAL KITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0), -- Amount in INR (₹)
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    rating_count INTEGER NOT NULL DEFAULT 0,
    cook_time_minutes INTEGER DEFAULT 15,
    servings INTEGER DEFAULT 2,
    spice_level VARCHAR(20) DEFAULT 'Medium',
    raw_ingredients JSONB DEFAULT '[]'::jsonb, -- Raw material components
    cooking_script JSONB DEFAULT '[]'::jsonb,   -- Step-by-step DIY recipe script
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. ADDRESSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home',
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. DRIVERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) DEFAULT 'Two-Wheeler',
    vehicle_number VARCHAR(50),
    is_online BOOLEAN NOT NULL DEFAULT false,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    last_location_update TIMESTAMPTZ,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED' CHECK (
        status IN (
            'PLACED',
            'CONFIRMED',
            'PREPARING',
            'READY_FOR_PICKUP',
            'DRIVER_ASSIGNED',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED'
        )
    ),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address TEXT NOT NULL,
    delivery_latitude NUMERIC(10, 7) NOT NULL,
    delivery_longitude NUMERIC(10, 7) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH_ON_DELIVERY' 
        CHECK (payment_method IN ('CASH_ON_DELIVERY', 'ONLINE_MOCK', 'UPI')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    delivery_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

-- ==============================================================================
-- 8. DRIVER LOCATIONS TABLE (Historical GPS tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 9. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('ORDER_STATUS', 'DRIVER_ASSIGNED', 'DELIVERY_UPDATE', 'SYSTEM', 'PROMOTION')
    ),
    related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. REVIEWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_food_items_category_id ON public.food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_is_available ON public.food_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_food_id ON public.order_items(food_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_order_id ON public.driver_locations(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_timestamp ON public.driver_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON public.drivers(is_online);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_food_items_updated_at ON public.food_items;
CREATE TRIGGER set_food_items_updated_at
    BEFORE UPDATE ON public.food_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_addresses_updated_at ON public.addresses;
CREATE TRIGGER set_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_drivers_updated_at ON public.drivers;
CREATE TRIGGER set_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- AUTOMATED USER SIGNUP TRIGGER (auth.users -> public.profiles & public.drivers)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role VARCHAR(20);
    user_name VARCHAR(255);
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER');
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

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
        VALUES (NEW.id, false)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ORDER STATE MACHINE TRANSITION VALIDATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'CANCELLED' THEN
        IF OLD.status IN ('PLACED', 'CONFIRMED', 'PREPARING') THEN
            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'Cannot cancel order once packed or dispatched. Current status: %', OLD.status;
        END IF;
    END IF;

    IF OLD.status = 'PLACED' AND NEW.status = 'CONFIRMED' THEN
        RETURN NEW;
    ELSIF OLD.status = 'CONFIRMED' AND NEW.status = 'PREPARING' THEN
        RETURN NEW;
    ELSIF OLD.status = 'PREPARING' AND NEW.status = 'READY_FOR_PICKUP' THEN
        RETURN NEW;
    ELSIF OLD.status = 'READY_FOR_PICKUP' AND NEW.status = 'DRIVER_ASSIGNED' THEN
        RETURN NEW;
    ELSIF OLD.status = 'DRIVER_ASSIGNED' AND NEW.status = 'PICKED_UP' THEN
        RETURN NEW;
    ELSIF OLD.status = 'PICKED_UP' AND NEW.status = 'OUT_FOR_DELIVERY' THEN
        RETURN NEW;
    ELSIF OLD.status = 'OUT_FOR_DELIVERY' AND NEW.status = 'DELIVERED' THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid order state transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_order_transition ON public.orders;
CREATE TRIGGER check_order_transition
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.validate_order_status_transition();

-- ==============================================================================
-- AUTOMATIC NOTIFICATION TRIGGER (CLEAN, NO EMOJIS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    title_text TEXT;
    body_text TEXT;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'CONFIRMED' THEN
                title_text := 'Order Confirmed';
                body_text := 'Your meal kit order ' || NEW.order_number || ' has been confirmed by the kitchen hub.';
            WHEN 'PREPARING' THEN
                title_text := 'Packaging Meal Kit';
                body_text := 'Fresh pre-cut ingredients and spices are being packed for your order.';
            WHEN 'READY_FOR_PICKUP' THEN
                title_text := 'Kit Packed and Ready';
                body_text := 'Your order is sealed with fresh recipe scripts, awaiting driver pickup.';
            WHEN 'DRIVER_ASSIGNED' THEN
                title_text := 'Delivery Partner Assigned';
                body_text := 'A delivery partner has been assigned to collect your meal kit.';
            WHEN 'PICKED_UP' THEN
                title_text := 'Order Picked Up';
                body_text := 'Your delivery partner has collected your package from the central hub.';
            WHEN 'OUT_FOR_DELIVERY' THEN
                title_text := 'Out for Delivery';
                body_text := 'Your delivery partner is on the way with your meal kit. Track live on map.';
            WHEN 'DELIVERED' THEN
                title_text := 'Order Delivered';
                body_text := 'Your meal kit has arrived. Follow your cooking script and enjoy your meal.';
            WHEN 'CANCELLED' THEN
                title_text := 'Order Cancelled';
                body_text := 'Your order ' || NEW.order_number || ' has been cancelled.';
            ELSE
                title_text := 'Order Update';
                body_text := 'Order ' || NEW.order_number || ' status is now ' || NEW.status;
        END CASE;

        INSERT INTO public.notifications (user_id, title, body, type, related_order_id)
        VALUES (NEW.customer_id, title_text, body_text, 'ORDER_STATUS', NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_order_status ON public.orders;
CREATE TRIGGER trigger_notify_order_status
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_order_status_change();
