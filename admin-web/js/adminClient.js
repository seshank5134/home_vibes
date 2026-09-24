/**
 * HomeVibes Admin Web — Data Access & Management Client
 * Interacts with Supabase PostgreSQL, manages orders, inventory, and driver dispatches.
 */

class AdminDataService {
  constructor() {
    this.client = null;
    this.isCloud = false;
    this.currentAdmin = null;
    this.init();
  }

  init() {
    const url = window.AppConfig ? window.AppConfig.getSupabaseUrl() : "";
    const key = window.AppConfig ? window.AppConfig.getSupabaseAnonKey() : "";

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isCloud = true;
        console.log("☁️ Admin Web connected to Supabase:", url);
      } catch (e) {
        this.isCloud = false;
      }
    } else {
      this.isCloud = false;
    }

    this.restoreSession();
  }

  restoreSession() {
    const cached = localStorage.getItem("HOMEVIBES_ACTIVE_ADMIN");
    if (cached) {
      try {
        this.currentAdmin = JSON.parse(cached);
      } catch (e) {
        this.currentAdmin = null;
      }
    }
  }

  // ============================================================================
  // ADMIN AUTHENTICATION
  // ============================================================================
  async login(email, password) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check role in profiles
      const { data: profile } = await this.client
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile && profile.role !== "ADMIN") {
        await this.client.auth.signOut();
        throw new Error("Access denied: Your account does not possess the ADMIN role.");
      }

      this.currentAdmin = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || "Kitchen Admin",
        role: "ADMIN"
      };
      localStorage.setItem("HOMEVIBES_ACTIVE_ADMIN", JSON.stringify(this.currentAdmin));
      return this.currentAdmin;
    }

    // Mock Admin Login
    this.currentAdmin = {
      id: "a1111111-aaaa-1111-aaaa-111111111111",
      email: email || "admin@homevibes.com",
      name: "Chef Marcus (Executive Admin)",
      role: "ADMIN"
    };
    localStorage.setItem("HOMEVIBES_ACTIVE_ADMIN", JSON.stringify(this.currentAdmin));
    return this.currentAdmin;
  }

  async logout() {
    if (this.isCloud && this.client) {
      await this.client.auth.signOut();
    }
    this.currentAdmin = null;
    localStorage.removeItem("HOMEVIBES_ACTIVE_ADMIN");
  }

  getCurrentAdmin() {
    return this.currentAdmin;
  }

  // ============================================================================
  // DASHBOARD METRICS
  // ============================================================================
  async getDashboardMetrics() {
    if (this.isCloud && this.client) {
      const { count: totalOrders } = await this.client.from("orders").select("*", { count: "exact", head: true });
      const { count: activeOrders } = await this.client
        .from("orders")
        .select("*", { count: "exact", head: true })
        .not("status", "in", '("DELIVERED","CANCELLED")');
      const { count: completedOrders } = await this.client.from("orders").select("*", { count: "exact", head: true }).eq("status", "DELIVERED");
      const { count: onlineDrivers } = await this.client.from("drivers").select("*", { count: "exact", head: true }).eq("is_online", true);
      const { count: totalCustomers } = await this.client.from("profiles").select("*", { count: "exact", head: true }).eq("role", "CUSTOMER");
      const { count: totalFoodItems } = await this.client.from("food_items").select("*", { count: "exact", head: true });

      const { data: revData } = await this.client.from("orders").select("total_amount").eq("status", "DELIVERED");
      const revenue = (revData || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      return {
        totalOrders: totalOrders || 0,
        activeOrders: activeOrders || 0,
        completedOrders: completedOrders || 0,
        onlineDrivers: onlineDrivers || 0,
        totalCustomers: totalCustomers || 0,
        totalFoodItems: totalFoodItems || 0,
        revenue: revenue || 0
      };
    }

    // Mock Metrics
    const localOrders = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    return {
      totalOrders: 12 + localOrders.length,
      activeOrders: 3 + localOrders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length,
      completedOrders: 9,
      onlineDrivers: 2,
      totalCustomers: 18,
      totalFoodItems: 10,
      revenue: 342.50
    };
  }

  // ============================================================================
  // ORDERS MANAGEMENT
  // ============================================================================
  async getOrders(statusFilter = "ALL") {
    if (this.isCloud && this.client) {
      let query = this.client
        .from("orders")
        .select(`
          *,
          profiles (name, email, phone),
          drivers (
            id, vehicle_type, vehicle_number,
            profiles (name, phone)
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "ALL") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // Mock Orders
    let list = [
      {
        id: "ord-mock-1",
        order_number: "HV-847291",
        customer_name: "Ananya Sharma",
        customer_phone: "+91 98765 43212",
        status: "OUT_FOR_DELIVERY",
        subtotal: 28.98,
        delivery_fee: 2.50,
        total_amount: 31.48,
        delivery_address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
        payment_method: "CASH_ON_DELIVERY",
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        driver_name: "Ravi Kumar (Speedy Driver)",
        driver_id: "d2222222-bbbb-2222-bbbb-222222222222"
      },
      {
        id: "ord-mock-2",
        order_number: "HV-519203",
        customer_name: "Karan Mehta",
        customer_phone: "+91 98765 43215",
        status: "PREPARING",
        subtotal: 24.50,
        delivery_fee: 2.50,
        total_amount: 27.00,
        delivery_address: "Koramangala 4th Block, 80ft Road, Bengaluru",
        payment_method: "ONLINE_MOCK",
        created_at: new Date(Date.now() - 25 * 60000).toISOString(),
        driver_name: null,
        driver_id: null
      },
      {
        id: "ord-mock-3",
        order_number: "HV-102948",
        customer_name: "Siddharth Rao",
        customer_phone: "+91 98765 43219",
        status: "READY_FOR_PICKUP",
        subtotal: 42.00,
        delivery_fee: 0.00,
        total_amount: 42.00,
        delivery_address: "Lavelle Road, Shanthala Nagar, Bengaluru",
        payment_method: "ONLINE_MOCK",
        created_at: new Date(Date.now() - 35 * 60000).toISOString(),
        driver_name: null,
        driver_id: null
      }
    ];

    const extra = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    list = [...extra, ...list];

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter(o => o.status === statusFilter);
    }
    return list;
  }

  async updateOrderStatus(orderId, newStatus) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Mock Update
    const extra = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    const item = extra.find(o => o.id === orderId);
    if (item) {
      item.status = newStatus;
      localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(extra));
    }
    return { id: orderId, status: newStatus };
  }

  async assignDriver(orderId, driverId) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("orders")
        .update({
          driver_id: driverId,
          status: "DRIVER_ASSIGNED",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { success: true };
  }

  // ============================================================================
  // DRIVER FLEET
  // ============================================================================
  async getDrivers() {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("drivers")
        .select(`
          *,
          profiles (name, email, phone)
        `)
        .order("is_online", { ascending: false });
      if (error) throw error;
      return data;
    }

    return [
      {
        id: "d2222222-bbbb-2222-bbbb-222222222222",
        name: "Ravi Kumar (Speedy Driver)",
        phone: "+91 98765 43211",
        vehicle_type: "Electric Scooter",
        vehicle_number: "KA-01-HV-2026",
        is_online: true,
        current_latitude: 12.9745,
        current_longitude: 77.6180,
        total_deliveries: 48,
        rating: 4.96
      },
      {
        id: "d3333333-bbbb-3333-bbbb-333333333333",
        name: "Vikram Singh (Express Fleet)",
        phone: "+91 98765 43216",
        vehicle_type: "Motorcycle",
        vehicle_number: "KA-04-HV-1088",
        is_online: true,
        current_latitude: 12.9716,
        current_longitude: 77.5946,
        total_deliveries: 32,
        rating: 4.88
      },
      {
        id: "d4444444-bbbb-4444-bbbb-444444444444",
        name: "Arjun Das",
        phone: "+91 98765 43218",
        vehicle_type: "Electric Bike",
        vehicle_number: "KA-05-HV-3490",
        is_online: false,
        current_latitude: null,
        current_longitude: null,
        total_deliveries: 15,
        rating: 4.70
      }
    ];
  }

  // ============================================================================
  // FOOD CATALOGUE MANAGEMENT
  // ============================================================================
  async getFoodItems() {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("food_items")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
    return window.HOMEVIBES_MOCK_DATA ? window.HOMEVIBES_MOCK_DATA.foodItems : [];
  }

  async saveFoodItem(itemData) {
    if (this.isCloud && this.client) {
      if (itemData.id) {
        const { data, error } = await this.client
          .from("food_items")
          .update(itemData)
          .eq("id", itemData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.client
          .from("food_items")
          .insert([itemData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }
    return { ...itemData, id: itemData.id || "food-" + Date.now() };
  }

  async toggleFoodAvailability(foodId, isAvailable) {
    if (this.isCloud && this.client) {
      const { data, error } = await this.client
        .from("food_items")
        .update({ is_available: isAvailable })
        .eq("id", foodId);
      if (error) throw error;
      return data;
    }
    return { success: true };
  }

  // Realtime subscription for live incoming orders
  subscribeToOrders(onUpdate) {
    if (!this.isCloud || !this.client) return () => {};

    const channel = this.client
      .channel("admin_orders_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        payload => {
          console.log("⚡ Admin Realtime Order Event:", payload);
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}

window.adminDataService = new AdminDataService();
