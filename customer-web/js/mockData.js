/**
 * HomeVibes Customer Web - Fallback Mock Data
 * Mirrors PostgreSQL database seed data for offline preview and resilient testing.
 */

window.HOMEVIBES_MOCK_DATA = {
  categories: [
    {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Burgers & Wraps",
      description: "Gourmet smashed patties, artisan buns, and handcrafted wraps",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      name: "Artisan Pizzas",
      description: "Wood-fired sourdough crusts with fresh San Marzano tomatoes and mozzarella",
      image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c3333333-3333-3333-3333-333333333333",
      name: "Asian Bowls & Noodles",
      description: "Fragrant stir-fries, ramen, steaming noodle bowls and teriyaki platters",
      image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      name: "Healthy Salads",
      description: "Organic greens, power grains, superfoods and fresh citrus vinaigrettes",
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c5555555-5555-5555-5555-555555555555",
      name: "Desserts & Bakes",
      description: "Warm molten cakes, artisan cookies, churros and gelato shakes",
      image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c6666666-6666-6666-6666-666666666666",
      name: "Beverages & Brews",
      description: "Specialty cold brews, iced matcha, boba, and fresh fruit lemonades",
      image_url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
      is_active: true
    }
  ],

  foodItems: [
    {
      id: "f1111111-0001-0000-0000-000000000001",
      category_id: "c1111111-1111-1111-1111-111111111111",
      name: "Truffle Double Smash Burger",
      description: "Two crispy-edged prime beef patties, black truffle aioli, melted aged cheddar, caramelized onions on a toasted brioche bun.",
      price: 12.99,
      image_url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.95,
      rating_count: 128,
      prep_time_minutes: 15
    },
    {
      id: "f1111111-0002-0000-0000-000000000002",
      category_id: "c1111111-1111-1111-1111-111111111111",
      name: "Spicy Nashville Crispy Chicken",
      description: "Buttermilk-fried chicken thigh tossed in habanero honey cayenne glaze, dill pickles, and creamy house slaw.",
      price: 11.50,
      image_url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.88,
      rating_count: 94,
      prep_time_minutes: 18
    },
    {
      id: "f1111111-0003-0000-0000-000000000003",
      category_id: "c1111111-1111-1111-1111-111111111111",
      name: "Avocado Green Goddess Veggie Wrap",
      description: "Herb-roasted chickpeas, baby spinach, crisp cucumbers, pickled red onions, sliced avocado, and house tahini goddess dressing.",
      price: 9.99,
      image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.75,
      rating_count: 42,
      prep_time_minutes: 12
    },
    {
      id: "f2222222-0001-0000-0000-000000000001",
      category_id: "c2222222-2222-2222-2222-222222222222",
      name: "Burrata Margherita DOP",
      description: "Slow-fermented sourdough crust, San Marzano tomato reduction, whole fresh burrata ball, fresh basil, and extra virgin olive oil.",
      price: 15.99,
      image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.92,
      rating_count: 156,
      prep_time_minutes: 20
    },
    {
      id: "f2222222-0002-0000-0000-000000000002",
      category_id: "c2222222-2222-2222-2222-222222222222",
      name: "Hot Honey & Charred Pepperoni",
      description: "Crisp cupped artisan pepperoni, fior di latte mozzarella, hot chili-infused honey drizzle, and fresh oregano.",
      price: 17.50,
      image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.89,
      rating_count: 210,
      prep_time_minutes: 22
    },
    {
      id: "f3333333-0001-0000-0000-000000000001",
      category_id: "c3333333-3333-3333-3333-333333333333",
      name: "Tokyo Tonkotsu Shoyu Ramen",
      description: "Rich 18-hour broth, handmade springy noodles, chashu pork belly, ajitsuke tamago egg, menma, and nori.",
      price: 14.99,
      image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.96,
      rating_count: 312,
      prep_time_minutes: 25
    },
    {
      id: "f3333333-0002-0000-0000-000000000002",
      category_id: "c3333333-3333-3333-3333-333333333333",
      name: "Teriyaki Chicken & Jasmine Rice Bowl",
      description: "Char-grilled chicken glazed with sweet mirin teriyaki, steamed broccoli, edamame, sesame seeds, and fragrant jasmine rice.",
      price: 13.50,
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.80,
      rating_count: 85,
      prep_time_minutes: 15
    },
    {
      id: "f4444444-0001-0000-0000-000000000001",
      category_id: "c4444444-4444-4444-4444-444444444444",
      name: "Mediterranean Quinoa & Feta Bowl",
      description: "Fluffy tri-color quinoa, kalamata olives, heirloom cherry tomatoes, Persian cucumbers, Greek feta cheese, and lemon herb dressing.",
      price: 11.25,
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.78,
      rating_count: 64,
      prep_time_minutes: 10
    },
    {
      id: "f5555555-0001-0000-0000-000000000001",
      category_id: "c5555555-5555-5555-5555-555555555555",
      name: "Molten Belgian Chocolate Lava Cake",
      description: "Warm dark chocolate cake with a rich molten center, served with vanilla bean ice cream swirl.",
      price: 7.50,
      image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.98,
      rating_count: 189,
      prep_time_minutes: 12
    },
    {
      id: "f6666666-0001-0000-0000-000000000001",
      category_id: "c6666666-6666-6666-6666-666666666666",
      name: "Nitro Cold Brew with Sweet Cream",
      description: "Slow-steeped single-origin Colombian cold brew infused with nitrogen, crowned with vanilla sweet cream.",
      price: 5.50,
      image_url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.84,
      rating_count: 115,
      prep_time_minutes: 5
    }
  ],

  defaultAddresses: [
    {
      id: "addr-001",
      label: "Home (Indiranagar)",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038",
      latitude: 12.9784,
      longitude: 77.6408,
      is_default: true
    },
    {
      id: "addr-002",
      label: "Office (Koramangala)",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, KA 560034",
      latitude: 12.9352,
      longitude: 77.6245,
      is_default: false
    }
  ]
};
