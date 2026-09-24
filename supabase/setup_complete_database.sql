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
-- ==============================================================================
-- HomeVibes — Cloud-Native Food Delivery Platform
-- Migration 002: Row Level Security (RLS) Policies
-- Enforcing Role-Based Access Control (RBAC) at the Database Engine Layer
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- HELPER FUNCTIONS FOR SECURITY CHECKS (SECURITY DEFINER for safe role querying)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_driver_id()
RETURNS UUID AS $$
DECLARE
    d_id UUID;
BEGIN
    SELECT id INTO d_id FROM public.drivers WHERE user_id = auth.uid() LIMIT 1;
    RETURN d_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 1. PROFILES POLICIES
-- ==============================================================================
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Profiles view policy"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Users can update only their own profile
CREATE POLICY "Profiles update policy"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ==============================================================================
-- 2. CATEGORIES POLICIES
-- ==============================================================================
-- Anyone (even unauthenticated) can view active categories
CREATE POLICY "Categories public read"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

-- Only admins can create/update/delete categories
CREATE POLICY "Categories admin all"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- 3. FOOD ITEMS POLICIES
-- ==============================================================================
-- Anyone can view available food items
CREATE POLICY "Food items public read"
    ON public.food_items FOR SELECT
    USING (is_available = true OR public.is_admin());

-- Only admins can insert, update, or delete food items
CREATE POLICY "Food items admin write"
    ON public.food_items FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- 4. ADDRESSES POLICIES
-- ==============================================================================
-- Customers manage their own delivery addresses
CREATE POLICY "Addresses own select"
    ON public.addresses FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Addresses own insert"
    ON public.addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Addresses own update"
    ON public.addresses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Addresses own delete"
    ON public.addresses FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. DRIVERS POLICIES
-- ==============================================================================
-- Drivers can read and update their own record; Admins have full access
CREATE POLICY "Drivers select policy"
    ON public.drivers FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Drivers update own record"
    ON public.drivers FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Drivers admin insert/delete"
    ON public.drivers FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- 6. ORDERS POLICIES
-- ==============================================================================
-- Customers can view their own orders;
-- Drivers can view orders assigned to them OR ready for pickup;
-- Admins can view all orders.
CREATE POLICY "Orders select policy"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = customer_id 
        OR driver_id = public.get_driver_id()
        OR (status IN ('READY_FOR_PICKUP', 'PREPARING') AND EXISTS (
            SELECT 1 FROM public.drivers WHERE user_id = auth.uid() AND is_online = true
        ))
        OR public.is_admin()
    );

-- Customers can create their own order
CREATE POLICY "Orders customer insert"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

-- Status updates: Customers can cancel if still PLACED;
-- Drivers can update their assigned orders;
-- Admins can update any order.
CREATE POLICY "Orders update policy"
    ON public.orders FOR UPDATE
    USING (
        (auth.uid() = customer_id AND status = 'PLACED')
        OR driver_id = public.get_driver_id()
        OR (status = 'READY_FOR_PICKUP' AND driver_id IS NULL) -- driver claiming
        OR public.is_admin()
    );

-- ==============================================================================
-- 7. ORDER ITEMS POLICIES
-- ==============================================================================
-- Can read order items if user can view the parent order
CREATE POLICY "Order items select policy"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = public.order_items.order_id
            AND (
                public.orders.customer_id = auth.uid()
                OR public.orders.driver_id = public.get_driver_id()
                OR public.is_admin()
            )
        )
    );

-- Order items can be inserted by the customer creating the order
CREATE POLICY "Order items insert policy"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = public.order_items.order_id
            AND public.orders.customer_id = auth.uid()
        )
    );

-- ==============================================================================
-- 8. DRIVER LOCATIONS POLICIES (GPS Streaming)
-- ==============================================================================
-- Driver can insert their own GPS readings
CREATE POLICY "Driver locations insert own"
    ON public.driver_locations FOR INSERT
    WITH CHECK (driver_id = public.get_driver_id());

-- Customer can read driver location for their active order
-- Driver can read own locations
-- Admin can read all locations
CREATE POLICY "Driver locations select"
    ON public.driver_locations FOR SELECT
    USING (
        driver_id = public.get_driver_id()
        OR EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.driver_locations.order_id
            AND public.orders.customer_id = auth.uid()
        )
        OR public.is_admin()
    );

-- ==============================================================================
-- 9. NOTIFICATIONS POLICIES
-- ==============================================================================
-- Users can only read & mark read their own notifications
CREATE POLICY "Notifications select own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Notifications update own"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 10. REVIEWS POLICIES
-- ==============================================================================
-- Anyone can view reviews
CREATE POLICY "Reviews public select"
    ON public.reviews FOR SELECT
    USING (true);

-- Customers can insert a review for their own delivered order
CREATE POLICY "Reviews insert own"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = customer_id
        AND EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.reviews.order_id
            AND public.orders.customer_id = auth.uid()
            AND public.orders.status = 'DELIVERED'
        )
    );
-- ==============================================================================
-- HomeVibes — Cloud-Native Food Delivery Platform
-- Seed Data: Indian DIY Meal Kits & Raw Materials with Cooking Scripts
-- Currency: Indian Rupee (INR - ₹)
-- ==============================================================================

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('food', 'food', true),
    ('categories', 'categories', true),
    ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Access for Food Images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id IN ('food', 'categories', 'profiles'));

CREATE POLICY "Authenticated users can upload images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id IN ('food', 'categories', 'profiles') AND auth.role() = 'authenticated');

-- ==============================================================================
-- 1. SEED CATEGORIES (Indian Cuisine Meal Kits)
-- ==============================================================================
INSERT INTO public.categories (id, name, description, image_url, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Biryani & Rice Kits', 'Pre-marinated meats, par-cooked basmati rice, fried onions and whole spices', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Curry & Gravy Kits', 'Slow-cooked artisanal gravies, fresh cuts, and roasted spice blends', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Paneer & Vegetarian', 'Farm-fresh malai paneer, organic greens, and homestyle dal kits', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Regional Meat Specials', 'Chettinad, Goan, and coastal raw material kits with freshly ground pastes', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Breads & Accompaniments', 'Fermented naan dough balls, Amritsari kulchas, and paratha kits', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', 5, true),
    ('c6666666-6666-6666-6666-666666666666', 'Mithai & Desserts', 'Handcrafted khoya dumplings, saffron reductions, and halwa kits', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80', 6, true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- ==============================================================================
-- 2. SEED INDIAN MEAL KITS & RAW MATERIALS WITH COOKING SCRIPTS
-- ==============================================================================
INSERT INTO public.food_items (
    id, category_id, name, description, price, image_url, is_available, is_featured,
    rating, rating_count, cook_time_minutes, servings, spice_level, raw_ingredients, cooking_script
) VALUES
    -- 1. Hyderabadi Dum Chicken Biryani Kit
    (
        'f1111111-0001-0000-0000-000000000001',
        'c1111111-1111-1111-1111-111111111111',
        'Hyderabadi Dum Chicken Biryani Kit',
        'Pre-marinated chicken, par-boiled aged Basmati rice, fried brown onions, saffron milk and whole garam masala.',
        349.00,
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        true, true, 4.95, 342, 20, 2, 'Medium',
        '["350g Marinated Chicken (Yogurt, Mint, Spices)", "250g 70% Par-boiled Aged Basmati Rice", "50ml Fried Onion Biryani Masala Paste", "20ml Desi Ghee", "Whole Spices (Cardamom, Cloves, Shahi Jeera, Star Anise)", "Saffron Milk & Fresh Mint Pouch"]'::jsonb,
        '[
            {"step": 1, "title": "Sauté Whole Spices", "instruction": "Heat a heavy pan on medium flame. Add desi ghee and whole spices. Sauté for 30 seconds until aromatic."},
            {"step": 2, "title": "Cook Chicken Base", "instruction": "Add marinated chicken and biryani gravy base. Cook on medium-high heat for 6-8 minutes until chicken is tender."},
            {"step": 3, "title": "Layer Basmati Rice", "instruction": "Layer the par-boiled basmati rice evenly over the chicken. Drizzle saffron milk and mint leaves on top."},
            {"step": 4, "title": "Dum Slow Steam", "instruction": "Cover tightly with lid. Cook on lowest flame for 10 minutes. Rest for 2 minutes before fluffing with a fork."}
        ]'::jsonb
    ),

    -- 2. Paneer Butter Masala DIY Kit
    (
        'f2222222-0001-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        'Paneer Butter Masala DIY Kit',
        '200g soft malai paneer cubes, slow-simmered tomato-cashew makhani gravy base, fresh butter, cream, and kasuri methi.',
        249.00,
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        true, true, 4.92, 280, 12, 2, 'Mild',
        '["200g Fresh Malai Paneer Cubes", "200ml Slow-Simmered Tomato Cashew Makhani Base", "25g Table Butter", "20ml Fresh Dairy Cream", "Whole Cumin & Bay Leaf", "Roasted Kasuri Methi & Garam Masala"]'::jsonb,
        '[
            {"step": 1, "title": "Melt Butter & Whole Spices", "instruction": "Melt butter in a pan over medium heat. Add bay leaf and cumin seeds, stirring for 20 seconds."},
            {"step": 2, "title": "Simmer Makhani Base", "instruction": "Pour in tomato-cashew makhani gravy base. Add 50ml water and bring to a gentle simmer for 3 minutes."},
            {"step": 3, "title": "Add Paneer Cubes", "instruction": "Add the fresh malai paneer cubes. Gently stir and simmer on low for 4-5 minutes so paneer absorbs the gravy."},
            {"step": 4, "title": "Finish & Garnish", "instruction": "Crush kasuri methi between palms into the gravy, drizzle fresh cream, and remove from heat."}
        ]'::jsonb
    ),

    -- 3. Chettinad Pepper Chicken Kit
    (
        'f4444444-0001-0000-0000-000000000001',
        'c4444444-4444-4444-4444-444444444444',
        'Chettinad Pepper Chicken Kit',
        '350g farm-fresh chicken chunks, roasted Chettinad black pepper spice paste, curry leaves, shallots, and cold-pressed sesame oil.',
        329.00,
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
        true, true, 4.88, 195, 15, 2, 'High',
        '["350g Fresh Diced Chicken", "150g Roasted Chettinad Spice Paste (Kalpasi, Fennel, Peppercorn)", "Fresh Curry Leaves & Sliced Shallots", "25ml Cold-pressed Sesame Oil", "Cracked Black Pepper Garnish"]'::jsonb,
        '[
            {"step": 1, "title": "Temper Aromatics", "instruction": "Heat sesame oil in a kadai. Add curry leaves and shallots, sautéing until translucent."},
            {"step": 2, "title": "Sear Chicken Chunks", "instruction": "Add chicken chunks and sear on high heat for 3 minutes to seal in juices."},
            {"step": 3, "title": "Simmer in Spice Paste", "instruction": "Stir in the Chettinad spice paste with 60ml water. Cover and cook on medium flame for 8 minutes."},
            {"step": 4, "title": "Toss & Finish", "instruction": "Uncover, turn to high heat, and toss for 2 minutes until gravy clings to chicken. Garnish with pepper."}
        ]'::jsonb
    ),

    -- 4. Dal Makhani Slow-Simmer Kit
    (
        'f3333333-0001-0000-0000-000000000001',
        'c3333333-3333-3333-3333-333333333333',
        'Dal Makhani Slow-Simmer Kit',
        'Pre-cooked 16-hour slow-simmered black urad lentils & rajma, white butter, fresh cream, ginger juliennes, and spices.',
        199.00,
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        true, false, 4.89, 164, 10, 2, 'Mild',
        '["300g Pre-simmered Black Urad Dal & Rajma", "30g White Butter", "25ml Fresh Dairy Cream", "Fresh Ginger Juliennes", "Degi Mirch & Garam Masala Pouch"]'::jsonb,
        '[
            {"step": 1, "title": "Warm Lentil Base", "instruction": "Transfer the pre-simmered black lentils into a saucepan over medium heat."},
            {"step": 2, "title": "Simmer with Butter", "instruction": "Add 50ml water and white butter. Simmer on low heat for 6 minutes, mashing slightly against the pan edge."},
            {"step": 3, "title": "Enrich with Cream", "instruction": "Stir in the spice blend and fresh cream. Simmer for 2 minutes until glossy and velvety."},
            {"step": 4, "title": "Ginger Garnish", "instruction": "Top with fresh ginger juliennes and serve with hot parathas or steamed basmati."}
        ]'::jsonb
    ),

    -- 5. Amritsari Chole & Kulcha Kit
    (
        'f5555555-0001-0000-0000-000000000001',
        'c5555555-5555-5555-5555-555555555555',
        'Amritsari Chole & Stuffed Kulcha Kit',
        'Boiled Kabuli chana in Punjabi anardana spice mix, 2 semi-baked potato-paneer stuffed Amritsari kulchas, and pickled onions.',
        219.00,
        'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
        true, true, 4.85, 210, 10, 2, 'Medium',
        '["250g Boiled Kabuli Chana", "100g Pindi Chole Gravy Masala Base (Anardana, Amchur, Spices)", "2 Semi-baked Stuffed Amritsari Kulchas", "Pickled Onions & Green Chilli Slit"]'::jsonb,
        '[
            {"step": 1, "title": "Heat Chole Base", "instruction": "In a pan, warm the chole gravy base. Add the boiled chickpeas and 50ml water."},
            {"step": 2, "title": "Simmer & Mash", "instruction": "Simmer for 5 minutes, gently crushing a few chickpeas with the back of a spoon to thicken."},
            {"step": 3, "title": "Toast Stuffed Kulchas", "instruction": "Toast the stuffed kulchas on a hot tawa with a dab of butter for 1-2 minutes per side until crisp and golden."},
            {"step": 4, "title": "Serve with Relish", "instruction": "Serve the hot Amritsari chole alongside crisp buttered kulchas and pickled onions."}
        ]'::jsonb
    ),

    -- 6. Goan Coconut Prawn Curry Kit
    (
        'f4444444-0002-0000-0000-000000000002',
        'c4444444-4444-4444-4444-444444444444',
        'Goan Coconut Prawn Curry Kit',
        '200g cleaned & deveined fresh prawns, freshly pressed coconut milk, Kashmiri chilli-kokum Goan curry paste, and green chillies.',
        379.00,
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
        true, false, 4.91, 142, 12, 2, 'Medium',
        '["200g Cleaned Fresh Tiger Prawns", "150ml Fresh Thick Coconut Milk", "100g Goan Kokum & Spice Paste", "Fresh Slit Green Chillies & Coriander"]'::jsonb,
        '[
            {"step": 1, "title": "Warm Curry Base", "instruction": "In a pot, bring Goan spice paste and 50ml water to a gentle boil on medium heat for 2 minutes."},
            {"step": 2, "title": "Whisk Coconut Milk", "instruction": "Lower the heat and gently pour in the thick coconut milk, stirring continuously to avoid splitting."},
            {"step": 3, "title": "Cook Tiger Prawns", "instruction": "Add the fresh prawns and slit chillies. Simmer gently for 4-5 minutes until prawns turn pink and tender."},
            {"step": 4, "title": "Rest & Serve", "instruction": "Turn off heat, let rest for 1 minute for kokum flavors to develop, and serve with steamed rice."}
        ]'::jsonb
    ),

    -- 7. Garlic Butter Naan Dough Kit
    (
        'f5555555-0002-0000-0000-000000000002',
        'c5555555-5555-5555-5555-555555555555',
        'Garlic Butter Naan Dough Kit',
        '3 freshly fermented sourdough naan dough balls, minced garlic & coriander butter mix, and kalonji nigella seeds.',
        149.00,
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        true, false, 4.80, 110, 8, 3, 'Mild',
        '["3 Fermented Naan Dough Balls", "40g Garlic Herb Butter", "Kalonji (Nigella Seeds) Pouch", "Dry Flour for Dusting"]'::jsonb,
        '[
            {"step": 1, "title": "Roll Out Naan", "instruction": "Dust a rolling surface with dry flour and roll out dough ball into an oval teardrop shape."},
            {"step": 2, "title": "Apply Kalonji & Water", "instruction": "Sprinkle kalonji seeds and press lightly with rolling pin. Brush the back side with water."},
            {"step": 3, "title": "Cook on Hot Tawa", "instruction": "Place wet side onto a smoking hot iron tawa. Cook for 1 minute until bubbles form, then invert tawa over open flame to char."},
            {"step": 4, "title": "Brush Garlic Butter", "instruction": "Brush generously with garlic herb butter while hot and serve immediately."}
        ]'::jsonb
    ),

    -- 8. Shahi Gulab Jamun DIY Kit
    (
        'f6666666-0001-0000-0000-000000000001',
        'c6666666-6666-6666-6666-666666666666',
        'Shahi Gulab Jamun DIY Kit',
        '8 fresh hand-rolled khoya dumplings, cardamom-rose saffron sugar syrup reduction, pure ghee, and crushed pistachios.',
        179.00,
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        true, true, 4.96, 230, 10, 4, 'Mild',
        '["8 Fresh Hand-rolled Khoya Dumplings", "200ml Cardamom Saffron Sugar Syrup", "Pure Desi Ghee for Frying", "Crushed Pistachio & Rose Petals"]'::jsonb,
        '[
            {"step": 1, "title": "Warm Syrup", "instruction": "Warm the sugar syrup in a bowl so it is warm (not boiling)."},
            {"step": 2, "title": "Fry Dumplings", "instruction": "Heat ghee in a small kadai on low flame. Gently slide in dumplings and fry on low heat for 5-6 minutes until deep golden."},
            {"step": 3, "title": "Immerse in Syrup", "instruction": "Remove dumplings with a slotted spoon and immerse immediately into the warm syrup."},
            {"step": 4, "title": "Soak & Garnish", "instruction": "Allow to soak for 15 minutes to absorb syrup. Garnish with crushed pistachios."}
        ]'::jsonb
    )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, price = EXCLUDED.price, image_url = EXCLUDED.image_url,
    raw_ingredients = EXCLUDED.raw_ingredients, cooking_script = EXCLUDED.cooking_script;
