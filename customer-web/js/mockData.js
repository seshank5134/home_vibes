/**
 * HomeVibes Customer Web - Fallback Mock Data
 * Indian Meal Kits & Raw Materials with Step-by-Step Cooking Scripts
 * Currency: Indian Rupee (INR - ₹)
 */

window.HOMEVIBES_MOCK_DATA = {
  categories: [
    {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Biryani & Rice Kits",
      description: "Pre-marinated meats, par-cooked basmati rice, fried onions and whole spices",
      image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      name: "Curry & Gravy Kits",
      description: "Slow-cooked artisanal gravies, fresh cuts, and roasted spice blends",
      image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c3333333-3333-3333-3333-333333333333",
      name: "Paneer & Vegetarian",
      description: "Farm-fresh malai paneer, organic greens, and homestyle dal kits",
      image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      name: "Regional Meat Specials",
      description: "Chettinad, Goan, and coastal raw material kits with freshly ground pastes",
      image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c5555555-5555-5555-5555-555555555555",
      name: "Breads & Accompaniments",
      description: "Fermented naan dough balls, Amritsari kulchas, and paratha kits",
      image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
      is_active: true
    },
    {
      id: "c6666666-6666-6666-6666-666666666666",
      name: "Mithai & Desserts",
      description: "Handcrafted khoya dumplings, saffron reductions, and halwa kits",
      image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      is_active: true
    }
  ],

  foodItems: [
    {
      id: "f1111111-0001-0000-0000-000000000001",
      category_id: "c1111111-1111-1111-1111-111111111111",
      name: "Hyderabadi Dum Chicken Biryani Kit",
      description: "Pre-marinated chicken, par-boiled aged Basmati rice, fried brown onions, saffron milk and whole garam masala.",
      price: 349.00,
      image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.95,
      rating_count: 342,
      cook_time_minutes: 20,
      servings: 2,
      spice_level: "Medium",
      raw_ingredients: [
        "350g Marinated Chicken (Yogurt, Mint, Spices)",
        "250g 70% Par-boiled Aged Basmati Rice",
        "50ml Fried Onion Biryani Masala Paste",
        "20ml Desi Ghee",
        "Whole Spices (Cardamom, Cloves, Shahi Jeera, Star Anise)",
        "Saffron Milk & Fresh Mint Pouch"
      ],
      cooking_script: [
        { step: 1, title: "Sauté Whole Spices", instruction: "Heat a heavy pan on medium flame. Add desi ghee and whole spices. Sauté for 30 seconds until aromatic." },
        { step: 2, title: "Cook Chicken Base", instruction: "Add marinated chicken and biryani gravy base. Cook on medium-high heat for 6-8 minutes until chicken is tender." },
        { step: 3, title: "Layer Basmati Rice", instruction: "Layer the par-boiled basmati rice evenly over the chicken. Drizzle saffron milk and mint leaves on top." },
        { step: 4, title: "Dum Slow Steam", instruction: "Cover tightly with lid. Cook on lowest flame for 10 minutes. Rest for 2 minutes before fluffing with a fork." }
      ]
    },
    {
      id: "f2222222-0001-0000-0000-000000000001",
      category_id: "c2222222-2222-2222-2222-222222222222",
      name: "Paneer Butter Masala DIY Kit",
      description: "200g soft malai paneer cubes, slow-simmered tomato-cashew makhani gravy base, fresh butter, cream, and kasuri methi.",
      price: 249.00,
      image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.92,
      rating_count: 280,
      cook_time_minutes: 12,
      servings: 2,
      spice_level: "Mild",
      raw_ingredients: [
        "200g Fresh Malai Paneer Cubes",
        "200ml Slow-Simmered Tomato Cashew Makhani Base",
        "25g Table Butter",
        "20ml Fresh Dairy Cream",
        "Whole Cumin & Bay Leaf",
        "Roasted Kasuri Methi & Garam Masala"
      ],
      cooking_script: [
        { step: 1, title: "Melt Butter & Whole Spices", instruction: "Melt butter in a pan over medium heat. Add bay leaf and cumin seeds, stirring for 20 seconds." },
        { step: 2, title: "Simmer Makhani Base", instruction: "Pour in tomato-cashew makhani gravy base. Add 50ml water and bring to a gentle simmer for 3 minutes." },
        { step: 3, title: "Add Paneer Cubes", instruction: "Add the fresh malai paneer cubes. Gently stir and simmer on low for 4-5 minutes so paneer absorbs the gravy." },
        { step: 4, title: "Finish & Garnish", instruction: "Crush kasuri methi between palms into the gravy, drizzle fresh cream, and remove from heat." }
      ]
    },
    {
      id: "f4444444-0001-0000-0000-000000000001",
      category_id: "c4444444-4444-4444-4444-444444444444",
      name: "Chettinad Pepper Chicken Kit",
      description: "350g farm-fresh chicken chunks, roasted Chettinad black pepper spice paste, curry leaves, shallots, and cold-pressed sesame oil.",
      price: 329.00,
      image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.88,
      rating_count: 195,
      cook_time_minutes: 15,
      servings: 2,
      spice_level: "High",
      raw_ingredients: [
        "350g Fresh Diced Chicken",
        "150g Roasted Chettinad Spice Paste (Kalpasi, Fennel, Peppercorn)",
        "Fresh Curry Leaves & Sliced Shallots",
        "25ml Cold-pressed Sesame Oil",
        "Cracked Black Pepper Garnish"
      ],
      cooking_script: [
        { step: 1, title: "Temper Aromatics", instruction: "Heat sesame oil in a kadai. Add curry leaves and shallots, sautéing until translucent." },
        { step: 2, title: "Sear Chicken Chunks", instruction: "Add chicken chunks and sear on high heat for 3 minutes to seal in juices." },
        { step: 3, title: "Simmer in Spice Paste", instruction: "Stir in the Chettinad spice paste with 60ml water. Cover and cook on medium flame for 8 minutes." },
        { step: 4, title: "Toss & Finish", instruction: "Uncover, turn to high heat, and toss for 2 minutes until gravy clings to chicken. Garnish with pepper." }
      ]
    },
    {
      id: "f3333333-0001-0000-0000-000000000001",
      category_id: "c3333333-3333-3333-3333-333333333333",
      name: "Dal Makhani Slow-Simmer Kit",
      description: "Pre-cooked 16-hour slow-simmered black urad lentils & rajma, white butter, fresh cream, ginger juliennes, and spices.",
      price: 199.00,
      image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.89,
      rating_count: 164,
      cook_time_minutes: 10,
      servings: 2,
      spice_level: "Mild",
      raw_ingredients: [
        "300g Pre-simmered Black Urad Dal & Rajma",
        "30g White Butter",
        "25ml Fresh Dairy Cream",
        "Fresh Ginger Juliennes",
        "Degi Mirch & Garam Masala Pouch"
      ],
      cooking_script: [
        { step: 1, title: "Warm Lentil Base", instruction: "Transfer the pre-simmered black lentils into a saucepan over medium heat." },
        { step: 2, title: "Simmer with Butter", instruction: "Add 50ml water and white butter. Simmer on low heat for 6 minutes, mashing slightly against the pan edge." },
        { step: 3, title: "Enrich with Cream", instruction: "Stir in the spice blend and fresh cream. Simmer for 2 minutes until glossy and velvety." },
        { step: 4, title: "Ginger Garnish", instruction: "Top with fresh ginger juliennes and serve with hot parathas or steamed basmati." }
      ]
    },
    {
      id: "f5555555-0001-0000-0000-000000000001",
      category_id: "c5555555-5555-5555-5555-555555555555",
      name: "Amritsari Chole & Stuffed Kulcha Kit",
      description: "Boiled Kabuli chana in Punjabi anardana spice mix, 2 semi-baked potato-paneer stuffed Amritsari kulchas, and pickled onions.",
      price: 219.00,
      image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.85,
      rating_count: 210,
      cook_time_minutes: 10,
      servings: 2,
      spice_level: "Medium",
      raw_ingredients: [
        "250g Boiled Kabuli Chana",
        "100g Pindi Chole Gravy Masala Base (Anardana, Amchur, Spices)",
        "2 Semi-baked Stuffed Amritsari Kulchas",
        "Pickled Onions & Green Chilli Slit"
      ],
      cooking_script: [
        { step: 1, title: "Heat Chole Base", instruction: "In a pan, warm the chole gravy base. Add the boiled chickpeas and 50ml water." },
        { step: 2, title: "Simmer & Mash", instruction: "Simmer for 5 minutes, gently crushing a few chickpeas with the back of a spoon to thicken." },
        { step: 3, title: "Toast Stuffed Kulchas", instruction: "Toast the stuffed kulchas on a hot tawa with a dab of butter for 1-2 minutes per side until crisp and golden." },
        { step: 4, title: "Serve with Relish", instruction: "Serve the hot Amritsari chole alongside crisp buttered kulchas and pickled onions." }
      ]
    },
    {
      id: "f4444444-0002-0000-0000-000000000002",
      category_id: "c4444444-4444-4444-4444-444444444444",
      name: "Goan Coconut Prawn Curry Kit",
      description: "200g cleaned & deveined fresh prawns, freshly pressed coconut milk, Kashmiri chilli-kokum Goan curry paste, and green chillies.",
      price: 379.00,
      image_url: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.91,
      rating_count: 142,
      cook_time_minutes: 12,
      servings: 2,
      spice_level: "Medium",
      raw_ingredients: [
        "200g Cleaned Fresh Tiger Prawns",
        "150ml Fresh Thick Coconut Milk",
        "100g Goan Kokum & Spice Paste",
        "Fresh Slit Green Chillies & Coriander"
      ],
      cooking_script: [
        { step: 1, title: "Warm Curry Base", instruction: "In a pot, bring Goan spice paste and 50ml water to a gentle boil on medium heat for 2 minutes." },
        { step: 2, title: "Whisk Coconut Milk", instruction: "Lower the heat and gently pour in the thick coconut milk, stirring continuously to avoid splitting." },
        { step: 3, title: "Cook Tiger Prawns", instruction: "Add the fresh prawns and slit chillies. Simmer gently for 4-5 minutes until prawns turn pink and tender." },
        { step: 4, title: "Rest & Serve", instruction: "Turn off heat, let rest for 1 minute for kokum flavors to develop, and serve with steamed rice." }
      ]
    },
    {
      id: "f5555555-0002-0000-0000-000000000002",
      category_id: "c5555555-5555-5555-5555-555555555555",
      name: "Garlic Butter Naan Dough Kit",
      description: "3 freshly fermented sourdough naan dough balls, minced garlic & coriander butter mix, and kalonji nigella seeds.",
      price: 149.00,
      image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: false,
      rating: 4.80,
      rating_count: 110,
      cook_time_minutes: 8,
      servings: 3,
      spice_level: "Mild",
      raw_ingredients: [
        "3 Fermented Naan Dough Balls",
        "40g Garlic Herb Butter",
        "Kalonji (Nigella Seeds) Pouch",
        "Dry Flour for Dusting"
      ],
      cooking_script: [
        { step: 1, title: "Roll Out Naan", instruction: "Dust a rolling surface with dry flour and roll out dough ball into an oval teardrop shape." },
        { step: 2, title: "Apply Kalonji & Water", instruction: "Sprinkle kalonji seeds and press lightly with rolling pin. Brush the back side with water." },
        { step: 3, title: "Cook on Hot Tawa", instruction: "Place wet side onto a smoking hot iron tawa. Cook for 1 minute until bubbles form, then invert tawa over open flame to char." },
        { step: 4, title: "Brush Garlic Butter", instruction: "Brush generously with garlic herb butter while hot and serve immediately." }
      ]
    },
    {
      id: "f6666666-0001-0000-0000-000000000001",
      category_id: "c6666666-6666-6666-6666-666666666666",
      name: "Shahi Gulab Jamun DIY Kit",
      description: "8 fresh hand-rolled khoya dumplings, cardamom-rose saffron sugar syrup reduction, pure ghee, and crushed pistachios.",
      price: 179.00,
      image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      is_available: true,
      is_featured: true,
      rating: 4.96,
      rating_count: 230,
      cook_time_minutes: 10,
      servings: 4,
      spice_level: "Mild",
      raw_ingredients: [
        "8 Fresh Hand-rolled Khoya Dumplings",
        "200ml Cardamom Saffron Sugar Syrup",
        "Pure Desi Ghee for Frying",
        "Crushed Pistachio & Rose Petals"
      ],
      cooking_script: [
        { step: 1, title: "Warm Syrup", instruction: "Warm the sugar syrup in a bowl so it is warm (not boiling)." },
        { step: 2, title: "Fry Dumplings", instruction: "Heat ghee in a small kadai on low flame. Gently slide in dumplings and fry on low heat for 5-6 minutes until deep golden." },
        { step: 3, title: "Immerse in Syrup", instruction: "Remove dumplings with a slotted spoon and immerse immediately into the warm syrup." },
        { step: 4, title: "Soak & Garnish", instruction: "Allow to soak for 15 minutes to absorb syrup. Garnish with crushed pistachios." }
      ]
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
