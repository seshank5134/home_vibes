/**
 * HomeVibes Customer Web - Supabase Client & Data Access Layer
 * Handles authentication, queries, orders, real-time tracking, and auto-assignment.
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
        console.log("[Supabase] Connected to live cloud backend:", url);
      } catch (err) {
        console.warn("[Supabase] Error initializing live client, falling back to local adapter:", err);
        this.isCloud = false;
      }
    } else {
      console.log("[Supabase] Running in local adapter mode (Supabase URL/Key not yet configured).");
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
  async signUp(emailOrObj, password, name, phone) {
    let email, pass, uName, uPhone;
    if (typeof emailOrObj === "object" && emailOrObj !== null) {
      email = emailOrObj.email;
      pass = emailOrObj.password;
      uName = emailOrObj.name;
      uPhone = emailOrObj.phone;
    } else {
      email = emailOrObj;
      pass = password;
      uName = name;
      uPhone = phone;
    }
    return this.register({ email, password: pass, name: uName, phone: uPhone });
  }

  async signIn(emailOrObj, password) {
    let email, pass;
    if (typeof emailOrObj === "object" && emailOrObj !== null) {
      email = emailOrObj.email;
      pass = emailOrObj.password;
    } else {
      email = emailOrObj;
      pass = password;
    }
    return this.login({ email, password: pass });
  }

  async signOut() {
    return this.logout();
  }

  async register({ email, password, name, phone }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || split_email(cleanEmail)).trim();

    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              name: cleanName,
              phone: phone || "+919876543210",
              role: "CUSTOMER"
            }
          }
        });

        if (error) {
          console.warn("[Auth] Cloud signUp warning:", error.message);
        }

        const userId = data?.user?.id || ("cust-" + Date.now());
        this.currentUser = {
          id: userId,
          email: cleanEmail,
          name: cleanName,
          phone: phone || "",
          role: "CUSTOMER"
        };
        localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
        return this.currentUser;
      } catch (cloudErr) {
        console.warn("[Auth] Cloud registration caught error, establishing local session:", cloudErr.message);
      }
    }

    // Local / Fallback Customer Session
    const mockId = "cust-" + Date.now();
    this.currentUser = {
      id: mockId,
      email: cleanEmail,
      name: cleanName || "Demo Customer",
      phone: phone || "+919876543212",
      role: "CUSTOMER"
    };
    localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async login({ email, password }) {
    const cleanEmail = (email || "").trim().toLowerCase();

    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!error && data?.user) {
          const { data: profile } = await this.client
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          this.currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: (profile && profile.name) || data.user.user_metadata?.name || split_email(cleanEmail),
            phone: (profile && profile.phone) || data.user.user_metadata?.phone || "",
            role: (profile && profile.role) || data.user.user_metadata?.role || "CUSTOMER"
          };

          localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
          return this.currentUser;
        }
      } catch (cloudErr) {
        console.warn("[Auth] Cloud signIn caught error:", cloudErr.message);
      }
    }

    // Local Mock Login fallback
    this.currentUser = {
      id: "c3333333-cccc-3333-cccc-333333333333",
      email: cleanEmail || "customer@homevibes.com",
      name: split_email(cleanEmail),
      phone: "+919876543212",
      role: "CUSTOMER"
    };
    localStorage.setItem("HOMEVIBES_ACTIVE_USER", JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async logout() {
    if (this.isCloud && this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {
        console.warn("[Auth] signOut note:", e.message);
      }
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

    // Determine best customer ID: auth UID > local signed-in > guest UUID
    const GUEST_UUID = "c3333333-cccc-3333-cccc-333333333333";
    let customerId = GUEST_UUID;

    if (this.isCloud && this.client) {
      try {
        const { data: sessionData } = await this.client.auth.getSession();
        const authUid = sessionData?.session?.user?.id;
        if (authUid) {
          customerId = authUid;
        } else if (this.currentUser && this.currentUser.id && !this.currentUser.id.startsWith("cust-")) {
          customerId = this.currentUser.id;
        }
      } catch (e) {
        console.warn("[Orders] Session resolve:", e.message);
      }
    } else if (this.currentUser && this.currentUser.id && !this.currentUser.id.startsWith("cust-")) {
      customerId = this.currentUser.id;
    }

    const orderPayload = {
      order_number: orderNumber,
      customer_id: customerId,
      status: "PLACED",
      subtotal: Number(subtotal.toFixed(2)),
      delivery_fee: Number(deliveryFee.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      delivery_address: deliveryAddress,
      delivery_latitude: deliveryLat,
      payment_method: paymentMethod || "UPI",
      payment_status: orderData.paymentStatus || (["COD", "CASH_ON_DELIVERY"].includes(paymentMethod) ? "PENDING" : "PAID"),
      delivery_notes: notes || ""
    };

    // Always try Supabase first
    if (this.isCloud && this.client) {
      try {
        let { data: order, error: orderErr } = await this.client
          .from("orders")
          .insert([orderPayload])
          .select()
          .single();

        // If insert failed (e.g. FK constraint on customer_id), retry with customer_id: null
        if (orderErr && orderPayload.customer_id) {
          console.warn("[Orders] Primary insert failed (" + orderErr.message + "), retrying with customer_id: null...");
          const retryPayload = { ...orderPayload, customer_id: null };
          const retryRes = await this.client
            .from("orders")
            .insert([retryPayload])
            .select()
            .single();
          if (!retryRes.error && retryRes.data) {
            order = retryRes.data;
            orderErr = null;
          }
        }

        if (!orderErr && order) {
          console.log("[Orders] Saved to Supabase:", order.order_number);
          const lineItems = items.map(item => ({
            order_id: order.id,
            food_id: item.id,
            quantity: item.quantity,
            unit_price: Number(item.price.toFixed(2)),
            total_price: Number((item.price * item.quantity).toFixed(2))
          }));
          const { error: itemsErr } = await this.client.from("order_items").insert(lineItems);
          if (itemsErr) {
            console.warn("[Orders] Order items note:", itemsErr.message);
          }

          // Trigger auto-assign (fire and forget)
          this._triggerAutoAssign(order.id);

          // Mirror to localStorage so My Orders works offline
          const cached = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
          cached.unshift({ ...order, items: items.map(i => ({ ...i, total_price: i.price * i.quantity })) });
          localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(cached));

          return order;
        }
        console.warn("[Orders] Cloud insert note:", orderErr && orderErr.message, "- local fallback.");
      } catch (cloudErr) {
        console.warn("[Orders] Cloud exception:", cloudErr.message, "- local fallback.");
      }
    }

    // Offline fallback - localStorage only
    const mockOrder = {
      id: "ord-" + Date.now(),
      ...orderPayload,
      created_at: new Date().toISOString(),
      items: items.map(i => ({ ...i, total_price: i.price * i.quantity }))
    };
    const existing = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    existing.unshift(mockOrder);
    localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(existing));
    return mockOrder;
  }

  /** Fire and forget: call auto_assign_driver via Supabase RPC */
  async _triggerAutoAssign(orderId) {
    if (!this.isCloud || !this.client) return;
    try {
      const { data, error } = await this.client.rpc("auto_assign_driver", { p_order_id: orderId });
      if (error) {
        console.warn("[AutoAssign] RPC error:", error.message);
      } else {
        console.log("[AutoAssign] Result:", data);
      }
    } catch (e) {
      console.warn("[AutoAssign] Exception:", e.message);
    }
  }

  async getOrder(orderId) {
    if (this.isCloud && this.client) {
      try {
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
          .maybeSingle();

        if (order && !error) {
          return order;
        }
      } catch (err) {
        console.warn("[Orders] Cloud getOrder notice, trying local fallback:", err.message);
      }
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
        profiles: { name: "Ravi Kumar", phone: "+919876543211" }
      },
      order_items: [
        { id: "oi-1", quantity: 1, unit_price: 12.99, total_price: 12.99, food_items: { name: "Truffle Double Smash Burger" } },
        { id: "oi-2", quantity: 1, unit_price: 15.99, total_price: 15.99, food_items: { name: "Burrata Margherita DOP" } }
      ]
    };
  }

  /**
   * Get all orders for a customer — each checkout creates a separate order entry.
   * Returns orders sorted newest first.
   */
  async getCustomerOrders(customerId) {
    const targetId = customerId || this.currentUser?.id || "c3333333-cccc-3333-cccc-333333333333";
    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client
          .from("orders")
          .select(`
            *,
            order_items (
              id, quantity, unit_price, total_price,
              food_items (name, image_url)
            ),
            drivers (
              id, vehicle_type, vehicle_number,
              profiles (name, phone)
            )
          `)
          .or(`customer_id.eq.${targetId},customer_id.is.null`)
          .order("created_at", { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn("[Orders] Cloud getCustomerOrders notice:", err.message);
      }
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
  // ORDER TRACKING — Per-order timeline events
  // ============================================================================

  /**
   * Fetch full tracking timeline for a specific order.
   * Returns array of events sorted oldest to newest.
   */
  async getOrderTrackingEvents(orderId) {
    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client
          .from("order_tracking_events")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at", { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn("[Tracking] Cloud fetch error:", e.message);
      }
    }

    // Mock tracking events for local/demo mode
    return this._mockTrackingEvents(orderId);
  }

  /**
   * Real-time subscription to new tracking events for a specific order.
   * Fires onNewEvent({status, message, created_at}) for each update.
   * Returns an unsubscribe function.
   */
  subscribeToTrackingEvents(orderId, onNewEvent) {
    if (!this.isCloud || !this.client) {
      return this.simulateLocalTransitions(orderId, (update) => {
        onNewEvent({
          order_id: orderId,
          status: update.status,
          message: this._statusMessage(update.status),
          created_at: new Date().toISOString()
        });
      });
    }

    const channel = this.client
      .channel(`tracking_${orderId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "order_tracking_events",
        filter: `order_id=eq.${orderId}`
      }, payload => {
        console.log("[Realtime] New tracking event:", payload.new);
        if (onNewEvent) onNewEvent(payload.new);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`
      }, payload => {
        console.log("[Realtime] Order status updated:", payload.new.status);
        if (onNewEvent) onNewEvent({
          order_id: orderId,
          status: payload.new.status,
          message: this._statusMessage(payload.new.status),
          created_at: new Date().toISOString(),
          _order_update: true,
          order: payload.new
        });
      })
      .subscribe(status => {
        console.log(`[Realtime] Tracking channel ${orderId}:`, status);
      });

    return () => this.client.removeChannel(channel);
  }

  /**
   * Subscribe to driver live location — fires whenever driver GPS updates.
   */
  subscribeToDriverLiveLocation(driverId, onLocationUpdate) {
    if (!this.isCloud || !this.client) {
      return this.simulateLocalDriverGPS(null, onLocationUpdate);
    }

    const channel = this.client
      .channel(`driver_live_${driverId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "driver_live_locations",
        filter: `driver_id=eq.${driverId}`
      }, payload => {
        if (onLocationUpdate) onLocationUpdate({
          latitude: payload.new.latitude,
          longitude: payload.new.longitude,
          heading: payload.new.heading || 0,
          timestamp: payload.new.updated_at
        });
      })
      .subscribe();

    return () => this.client.removeChannel(channel);
  }

  /**
   * Fetch driver info by driver_id.
   */
  async getDriverInfo(driverId) {
    if (!this.isCloud || !this.client || !driverId) return null;
    try {
      const { data } = await this.client
        .from("drivers")
        .select("*, profiles(name, phone)")
        .eq("id", driverId)
        .single();
      return data;
    } catch (e) { return null; }
  }

  // ============================================================================
  // LEGACY REALTIME (kept for backward compatibility)
  // ============================================================================
  subscribeToOrder(orderId, onStatusChange) {
    if (!this.isCloud || !this.client) {
      console.log("[Realtime] Simulating local state transitions for demo.");
      return this.simulateLocalTransitions(orderId, onStatusChange);
    }

    const channel = this.client
      .channel(`order_status_${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`
      }, payload => {
        console.log("[Realtime] Order Update:", payload.new);
        if (onStatusChange) onStatusChange(payload.new);
      })
      .subscribe();

    return () => this.client.removeChannel(channel);
  }

  subscribeToDriverLocation(orderId, onLocationUpdate) {
    if (!this.isCloud || !this.client) {
      return this.simulateLocalDriverGPS(orderId, onLocationUpdate);
    }

    const channel = this.client
      .channel(`driver_loc_${orderId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "driver_locations",
        filter: `order_id=eq.${orderId}`
      }, payload => {
        if (onLocationUpdate) onLocationUpdate(payload.new);
      })
      .subscribe();

    return () => this.client.removeChannel(channel);
  }

  // ============================================================================
  // DEMO SIMULATORS
  // ============================================================================
  simulateLocalTransitions(orderId, callback) {
    const statuses = [
      { status: "CONFIRMED",        delay: 5000 },
      { status: "PREPARING",        delay: 10000 },
      { status: "READY_FOR_PICKUP", delay: 16000 },
      { status: "DRIVER_ASSIGNED",  delay: 22000 },
      { status: "PICKED_UP",        delay: 28000 },
      { status: "OUT_FOR_DELIVERY", delay: 34000 },
      { status: "DELIVERED",        delay: 45000 }
    ];

    const timers = [];
    statuses.forEach(({ status, delay }) => {
      const t = setTimeout(() => {
        console.log(`[Demo Simulation] Order status -> ${status}`);
        callback({ status });
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }

  simulateLocalDriverGPS(orderId, callback) {
    let step = 0;
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
        callback({ latitude: points[step].lat, longitude: points[step].lng, timestamp: new Date().toISOString() });
        step++;
      } else {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================
  _statusMessage(status) {
    const msgs = {
      PLACED:           "Your order has been placed successfully!",
      CONFIRMED:        "HomeVibes kitchen confirmed your order",
      PREPARING:        "Our chefs are preparing your fresh meal",
      READY_FOR_PICKUP: "Your order is packed and ready for pickup",
      DRIVER_ASSIGNED:  "A delivery partner has been assigned to you",
      PICKED_UP:        "Your order has been picked up by the driver",
      OUT_FOR_DELIVERY: "Your order is on its way to you!",
      DELIVERED:        "Order delivered! Enjoy your meal.",
      CANCELLED:        "Your order has been cancelled"
    };
    return msgs[status] || `Status updated: ${status}`;
  }

  _mockTrackingEvents(orderId) {
    const base = Date.now() - 45 * 60000;
    return [
      { id: "te-1", order_id: orderId, status: "PLACED",           message: "Your order has been placed successfully!",    created_at: new Date(base).toISOString() },
      { id: "te-2", order_id: orderId, status: "CONFIRMED",        message: "HomeVibes kitchen confirmed your order",       created_at: new Date(base + 3*60000).toISOString() },
      { id: "te-3", order_id: orderId, status: "PREPARING",        message: "Our chefs are preparing your fresh meal",      created_at: new Date(base + 10*60000).toISOString() },
      { id: "te-4", order_id: orderId, status: "READY_FOR_PICKUP", message: "Order is packed and ready for pickup",          created_at: new Date(base + 25*60000).toISOString() },
      { id: "te-5", order_id: orderId, status: "DRIVER_ASSIGNED",  message: "Ravi Kumar is assigned to your delivery",     created_at: new Date(base + 27*60000).toISOString() },
      { id: "te-6", order_id: orderId, status: "PICKED_UP",        message: "Your order has been picked up by the driver",  created_at: new Date(base + 30*60000).toISOString() },
      { id: "te-7", order_id: orderId, status: "OUT_FOR_DELIVERY", message: "Your order is on its way to you!",              created_at: new Date(base + 35*60000).toISOString() }
    ];
  }
}

function split_email(e) {
  return e ? e.split("@")[0] : "Customer";
}

window.dataService = new HomeVibesDataService();
window.authService = window.dataService;
