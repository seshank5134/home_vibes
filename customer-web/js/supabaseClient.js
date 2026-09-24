/**
 * HomeVibes Customer Web - Supabase Client & Data Access Layer
 * Handles authentication, queries, orders, and real-time WebSocket subscriptions.
 * Features an integrated Mock Fallback Adapter for zero-friction local testing.
 */

class HomeVibesDataService {
  constructor() {
    this.client = null;
    this.isCloud = false;
    this.currentUser = null;
    this.init();
  }

  init() {
    const url = window.AppConfig ? window.AppConfig.getSupabaseUrl() : "";
    const key = window.AppConfig ? window.AppConfig.getSupabaseAnonKey() : "";

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });
        this.isCloud = true;
        console.log("☁️ Connected to live Supabase cloud backend:", url);
      } catch (err) {
        console.warn("⚠️ Error initializing live Supabase client, falling back to local adapter:", err);
        this.isCloud = false;
      }
    } else {
      console.log("ℹ️ Running in resilient Local/Mock mode (Supabase URL/Key not yet configured).");
      this.isCloud = false;
    }

    // Restore cached session if any
    this.restoreSession();
  }

  restoreSession() {
    const cached = localStorage.getItem("HOMEVIBES_ACTIVE_USER");
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  async register({ email, password, name, phone }) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: "CUSTOMER"
          }
        }
      });
      if (error) throw error;
      this.currentUser = {
        id: data.user.id,
        email: data.user.email,
        name: name,
        phone: phone,
        role: "CUSTOMER"
      };
      localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
      return this.currentUser;
    } else {
      // Local Mock Register
      const mockId = "cust-" + Date.now();
      this.currentUser = {
        id: mockId,
        email,
        name: name || "Demo Customer",
        phone: phone || "+919876543212",
        role: "CUSTOMER"
      };
      localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
      return this.currentUser;
    }
  }

  async login({ email, password }) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      // Fetch user profile from public.profiles
      const { data: profile, error: profErr } = await this.client
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      this.currentUser = {
        id: data.user.id,
        email: data.user.email,
        name: (profile && profile.name) || data.user.user_metadata?.name || split_email(email),
        phone: (profile && profile.phone) || data.user.user_metadata?.phone || "",
        role: (profile && profile.role) || data.user.user_metadata?.role || "CUSTOMER"
      };

      localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
      return this.currentUser;
    } else {
      // Local Mock Login
      this.currentUser = {
        id: "c3333333-cccc-3333-cccc-333333333333",
        email: email || "customer@homevibes.com",
        name: "Ananya Sharma",
        phone: "+919876543212",
        role: "CUSTOMER"
      };
      localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
      return this.currentUser;
    }
  }

  async logout() {
    if (this.isCloud && this.client) {
      await this.client.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem("HOMEVIBES_ACTIVE_USER");
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // ============================================================================
  // CATEGORIES & FOOD ITEMS
  // ============================================================================
  async getCategories() {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    }
    return window.HOMEVIBES_MOCK_DATA.categories;
  }

  async getFoodItems(categoryId = null, query = "") {
    if (this.isCloud && this.client) {
      let req = this.client
        .from("food_items")
        .select("*, categories(name)")
        .eq("is_available", true);

      if (categoryId && categoryId !== "ALL") {
        req = req.eq("category_id", categoryId);
      }
      if (query && query.trim() !== "") {
        req = req.ilike("name", `%${query.trim()}%`);
      }

      const { data, error } = await req;
      if (error) throw error;
      return data;
    }

    // Mock search/filter
    let items = window.HOMEVIBES_MOCK_DATA.foodItems;
    if (categoryId && categoryId !== "ALL") {
      items = items.filter(i => i.category_id === categoryId);
    }
    if (query && query.trim() !== "") {
      const q = query.toLowerCase().trim();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }

  // ============================================================================
  // ADDRESSES
  // ============================================================================
  async getAddresses(userId) {
    if (this.isCloud && this.client && userId) {
      const { data, error } = await this.client
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data.length > 0 ? data : window.HOMEVIBES_MOCK_DATA.defaultAddresses;
    }
    return window.HOMEVIBES_MOCK_DATA.defaultAddresses;
  }

  async addAddress(addressData) {
    if (this.isCloud && this.client && this.currentUser) {
      const { data, error } = await this.client
        .from("addresses")
        .insert([{
          user_id: this.currentUser.id,
          label: addressData.label || "Home",
          address: addressData.address,
          latitude: addressData.latitude || 12.9716,
          longitude: addressData.longitude || 77.5946,
          is_default: addressData.is_default || false
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    // Mock save
    const newAddr = {
      id: "addr-" + Date.now(),
      ...addressData
    };
    window.HOMEVIBES_MOCK_DATA.defaultAddresses.push(newAddr);
    return newAddr;
  }

  // ============================================================================
  // ORDERS & CHECKOUT
  // ============================================================================
  async createOrder({ items, subtotal, deliveryFee, totalAmount, deliveryAddress, deliveryLat, deliveryLng, paymentMethod, notes }) {
    const orderNumber = "HV-" + Math.floor(100000 + Math.random() * 900000);
    const customerId = this.currentUser ? this.currentUser.id : "c3333333-cccc-3333-cccc-333333333333";

    if (this.isCloud && this.client) {
      // Insert into orders table
      const { data: order, error: orderErr } = await this.client
        .from("orders")
        .insert([{
          order_number: orderNumber,
          customer_id: customerId,
          status: "PLACED",
          subtotal: Number(subtotal.toFixed(2)),
          delivery_fee: Number(deliveryFee.toFixed(2)),
          total_amount: Number(totalAmount.toFixed(2)),
          delivery_address: deliveryAddress,
          delivery_latitude: deliveryLat,
          delivery_longitude: deliveryLng,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "ONLINE_MOCK" ? "PAID" : "PENDING",
          delivery_notes: notes || ""
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Insert line items
      const orderItemsToInsert = items.map(item => ({
        order_id: order.id,
        food_id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.price.toFixed(2)),
        total_price: Number((item.price * item.quantity).toFixed(2))
      }));

      const { error: itemsErr } = await this.client
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsErr) console.error("Error creating order items:", itemsErr);

      return order;
    }

    // Local Mock Order
    const mockOrder = {
      id: "ord-" + Date.now(),
      order_number: orderNumber,
      customer_id: customerId,
      status: "PLACED",
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      delivery_address: deliveryAddress,
      delivery_latitude: deliveryLat,
      delivery_longitude: deliveryLng,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "ONLINE_MOCK" ? "PAID" : "PENDING",
      delivery_notes: notes,
      created_at: new Date().toISOString(),
      items: items.map(i => ({ ...i, total_price: i.price * i.quantity }))
    };

    const existing = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    existing.unshift(mockOrder);
    localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(existing));

    return mockOrder;
  }

  async getOrder(orderId) {
    if (this.isCloud && this.client) {
      const { data: order, error } = await this.client
        .from("orders")
        .select(`
          *,
          drivers (
            id,
            vehicle_type,
            vehicle_number,
            current_latitude,
            current_longitude,
            profiles (name, phone)
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            food_items (name, image_url)
          )
        `)
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return order;
    }

    // Local Mock Order Retrieval
    const existing = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    const found = existing.find(o => o.id === orderId || o.order_number === orderId);
    if (found) return found;

    // Default sample order
    return {
      id: orderId,
      order_number: "HV-847291",
      status: "OUT_FOR_DELIVERY",
      subtotal: 28.98,
      delivery_fee: 2.50,
      total_amount: 31.48,
      delivery_address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
      delivery_latitude: 12.9784,
      delivery_longitude: 77.6408,
      payment_method: "CASH_ON_DELIVERY",
      payment_status: "PENDING",
      created_at: new Date().toISOString(),
      drivers: {
        id: "d2222222-bbbb-2222-bbbb-222222222222",
        vehicle_type: "Electric Scooter",
        vehicle_number: "KA-01-HV-2026",
        current_latitude: 12.9745,
        current_longitude: 77.6180,
        profiles: { name: "Ravi Kumar (Speedy Driver)", phone: "+919876543211" }
      },
      order_items: [
        { id: "oi-1", quantity: 1, unit_price: 12.99, total_price: 12.99, food_items: { name: "Truffle Double Smash Burger" } },
        { id: "oi-2", quantity: 1, unit_price: 15.99, total_price: 15.99, food_items: { name: "Burrata Margherita DOP" } }
      ]
    };
  }

  async getCustomerOrders(customerId) {
    if (this.isCloud && this.client && customerId) {
      const { data, error } = await this.client
        .from("orders")
        .select(`
          *,
          order_items (
            id, quantity, unit_price,
            food_items (name)
          )
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }

    return JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
  }

  // ============================================================================
  // REVIEWS & RATINGS
  // ============================================================================
  async submitReview({ orderId, rating, comment }) {
    if (this.isCloud && this.client && this.currentUser) {
      const { data, error } = await this.client
        .from("reviews")
        .insert([{
          order_id: orderId,
          customer_id: this.currentUser.id,
          rating: Number(rating),
          comment
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { success: true, message: "Review recorded locally!" };
  }

  // ============================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS
  // ============================================================================
  subscribeToOrder(orderId, onStatusChange) {
    if (!this.isCloud || !this.client) {
      console.log("ℹ️ Realtime: Simulating local state transitions for demo.");
      return this.simulateLocalTransitions(orderId, onStatusChange);
    }

    const channel = this.client
      .channel(`order_tracking_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`
        },
        payload => {
          console.log("⚡ Realtime Order Update Received:", payload.new);
          if (onStatusChange) onStatusChange(payload.new);
        }
      )
      .subscribe(status => {
        console.log(`📡 Realtime Channel for order ${orderId}:`, status);
      });

    return () => {
      this.client.removeChannel(channel);
    };
  }

  subscribeToDriverLocation(orderId, onLocationUpdate) {
    if (!this.isCloud || !this.client) {
      return this.simulateLocalDriverGPS(orderId, onLocationUpdate);
    }

    const channel = this.client
      .channel(`driver_loc_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "driver_locations",
          filter: `order_id=eq.${orderId}`
        },
        payload => {
          console.log("📍 Realtime GPS Coordinate Received:", payload.new);
          if (onLocationUpdate) onLocationUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  // Local Demo Simulators for seamless offline demonstration
  simulateLocalTransitions(orderId, callback) {
    const statuses = [
      { status: "CONFIRMED", delay: 5000 },
      { status: "PREPARING", delay: 10000 },
      { status: "READY_FOR_PICKUP", delay: 16000 },
      { status: "DRIVER_ASSIGNED", delay: 22000 },
      { status: "PICKED_UP", delay: 28000 },
      { status: "OUT_FOR_DELIVERY", delay: 34000 },
      { status: "DELIVERED", delay: 45000 }
    ];

    const timers = [];
    statuses.forEach(({ status, delay }) => {
      const t = setTimeout(() => {
        console.log(`[Demo Simulation] Order status transitioned to: ${status}`);
        callback({ status });
      }, delay);
      timers.push(t);
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }

  simulateLocalDriverGPS(orderId, callback) {
    let step = 0;
    // Route from Central Kitchen (12.9716, 77.5946) to Indiranagar (12.9784, 77.6408)
    const points = [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.9725, lng: 77.6020 },
      { lat: 12.9738, lng: 77.6110 },
      { lat: 12.9752, lng: 77.6200 },
      { lat: 12.9768, lng: 77.6310 },
      { lat: 12.9784, lng: 77.6408 }
    ];

    const interval = setInterval(() => {
      if (step < points.length) {
        callback({
          latitude: points[step].lat,
          longitude: points[step].lng,
          timestamp: new Date().toISOString()
        });
        step++;
      } else {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }
}

function split_email(e) {
  return e ? e.split("@")[0] : "Customer";
}

window.dataService = new HomeVibesDataService();
