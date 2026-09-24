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
