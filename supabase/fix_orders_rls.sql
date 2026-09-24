-- ==============================================================================
-- HomeVibes — Fix Orders & Order Items RLS (Row Level Security)
-- File: supabase/fix_orders_rls.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aymdlyhwqtgmaizwqotw/sql
-- ==============================================================================

-- 1. Allow any customer (authenticated or guest/anon) to create an order
DROP POLICY IF EXISTS "Orders customer insert" ON public.orders;
CREATE POLICY "Orders customer insert"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- 2. Allow customers, drivers, and admins to select orders
DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
CREATE POLICY "Orders select policy"
    ON public.orders FOR SELECT
    USING (true);

-- 3. Allow inserting order items for any placed order
DROP POLICY IF EXISTS "Order items insert policy" ON public.order_items;
CREATE POLICY "Order items insert policy"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- 4. Allow reading order items
DROP POLICY IF EXISTS "Order items select policy" ON public.order_items;
CREATE POLICY "Order items select policy"
    ON public.order_items FOR SELECT
    USING (true);

-- Verification:
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items');
