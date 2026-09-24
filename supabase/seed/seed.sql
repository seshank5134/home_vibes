-- ==============================================================================
-- HomeVibes — Cloud-Native Food Delivery Platform
-- Seed Data: Categories, Food Items & Storage Buckets
-- ==============================================================================

-- ==============================================================================
-- 1. SETUP STORAGE BUCKETS (If using Supabase Storage)
-- ==============================================================================
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
-- 2. SEED CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (id, name, description, image_url, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Burgers & Wraps', 'Gourmet smashed patties, artisan buns, and handcrafted wraps', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Artisan Pizzas', 'Wood-fired sourdough crusts with fresh San Marzano tomatoes and mozzarella', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Asian Bowls & Noodles', 'Fragrant stir-fries, ramen, steaming noodle bowls and teriyaki platters', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Healthy Salads', 'Organic greens, power grains, superfoods and fresh citrus vinaigrettes', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Desserts & Bakes', 'Warm molten cakes, artisan cookies, churros and gelato shakes', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', 5, true),
    ('c6666666-6666-6666-6666-666666666666', 'Beverages & Brews', 'Specialty cold brews, iced matcha, boba, and fresh fruit lemonades', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80', 6, true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- ==============================================================================
-- 3. SEED FOOD ITEMS
-- ==============================================================================
INSERT INTO public.food_items (id, category_id, name, description, price, image_url, is_available, is_featured, rating, rating_count, prep_time_minutes)
VALUES
    -- Burgers & Wraps
    ('f1111111-0001-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 
     'Truffle Double Smash Burger', 
     'Two crispy-edged prime beef patties, black truffle aioli, melted aged cheddar, caramelized onions on a toasted brioche bun.', 
     12.99, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.95, 128, 15),

    ('f1111111-0002-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', 
     'Spicy Nashville Crispy Chicken', 
     'Buttermilk-fried chicken thigh tossed in habanero honey cayenne glaze, dill pickles, and creamy house slaw.', 
     11.50, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.88, 94, 18),

    ('f1111111-0003-0000-0000-000000000003', 'c1111111-1111-1111-1111-111111111111', 
     'Avocado Green Goddess Veggie Wrap', 
     'Herb-roasted chickpeas, baby spinach, crisp cucumbers, pickled red onions, sliced avocado, and house tahini goddess dressing.', 
     9.99, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80', 
     true, false, 4.75, 42, 12),

    -- Artisan Pizzas
    ('f2222222-0001-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222', 
     'Burrata Margherita DOP', 
     'Slow-fermented sourdough crust, San Marzano tomato reduction, whole fresh burrata ball, fresh basil, and extra virgin olive oil.', 
     15.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.92, 156, 20),

    ('f2222222-0002-0000-0000-000000000002', 'c2222222-2222-2222-2222-222222222222', 
     'Hot Honey & Charred Pepperoni', 
     'Crisp cupped artisan pepperoni, fior di latte mozzarella, hot chili-infused honey drizzle, and fresh oregano.', 
     17.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.89, 210, 22),

    -- Asian Bowls & Noodles
    ('f3333333-0001-0000-0000-000000000001', 'c3333333-3333-3333-3333-333333333333', 
     'Tokyo Tonkotsu Shoyu Ramen', 
     'Rich 18-hour broth, handmade springy noodles, chashu pork belly, ajitsuke tamago egg, menma, and nori.', 
     14.99, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.96, 312, 25),

    ('f3333333-0002-0000-0000-000000000002', 'c3333333-3333-3333-3333-333333333333', 
     'Teriyaki Chicken & Jasmine Rice Bowl', 
     'Char-grilled chicken glazed with sweet mirin teriyaki, steamed broccoli, edamame, sesame seeds, and fragrant jasmine rice.', 
     13.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 
     true, false, 4.80, 85, 15),

    -- Healthy Salads
    ('f4444444-0001-0000-0000-000000000001', 'c4444444-4444-4444-4444-444444444444', 
     'Mediterranean Quinoa & Feta Bowl', 
     'Fluffy tri-color quinoa, kalamata olives, heirloom cherry tomatoes, Persian cucumbers, Greek feta cheese, and lemon herb dressing.', 
     11.25, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', 
     true, false, 4.78, 64, 10),

    -- Desserts & Bakes
    ('f5555555-0001-0000-0000-000000000001', 'c5555555-5555-5555-5555-555555555555', 
     'Molten Belgian Chocolate Lava Cake', 
     'Warm dark chocolate cake with a rich molten center, served with vanilla bean ice cream swirl.', 
     7.50, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 
     true, true, 4.98, 189, 12),

    -- Beverages & Brews
    ('f6666666-0001-0000-0000-000000000001', 'c6666666-6666-6666-6666-666666666666', 
     'Nitro Cold Brew with Sweet Cream', 
     'Slow-steeped single-origin Colombian cold brew infused with nitrogen, crowned with vanilla sweet cream.', 
     5.50, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80', 
     true, false, 4.84, 115, 5)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, price = EXCLUDED.price, image_url = EXCLUDED.image_url;
