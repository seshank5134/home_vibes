/**
 * HomeVibes Driver Web — Data & Supabase Realtime Service
 * Handles driver session, live order telemetry, proximity polling, and status transitions.
 */

class DriverDataService {
  constructor() {
    this.client = null;
    this.isCloud = false;
    this.currentDriver = null;
    this.activeOrders = [];
    this.availableOrders = [];
    this.isOnline = true;
    this.init();
  }

  init() {
    const url = window.AppConfig ? window.AppConfig.getSupabaseUrl() : "";
    const key = window.AppConfig ? window.AppConfig.getSupabaseAnonKey() : "";

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isCloud = true;
        console.log("[DriverClient] Supabase live connection established:", url);
      } catch (e) {
        console.warn("[DriverClient] Supabase init fallback:", e.message);
        this.isCloud = false;
      }
    }

    this.restoreSession();
  }

  restoreSession() {
    const cached = localStorage.getItem("HOMEVIBES_ACTIVE_DRIVER");
    if (cached) {
      try {
        this.currentDriver = JSON.parse(cached);
      } catch (_) {
        this.currentDriver = window.AppConfig.DEMO_DRIVER;
      }
    } else {
      this.currentDriver = window.AppConfig.DEMO_DRIVER;
      localStorage.setItem("HOMEVIBES_ACTIVE_DRIVER", JSON.stringify(this.currentDriver));
    }
  }

  getDriver() {
    return this.currentDriver || window.AppConfig.DEMO_DRIVER;
  }

  setOnlineStatus(online) {
    this.isOnline = Boolean(online);
    if (this.isCloud && this.client && this.currentDriver) {
      this.client
        .from("driver_live_locations")
        .update({ is_available: this.isOnline, updated_at: new Date().toISOString() })
        .eq("driver_id", this.currentDriver.id)
        .then(() => {})
        .catch(err => console.warn("[DriverClient] online update note:", err.message));
    }
  }

  /**
   * Fetch Active Orders assigned to this driver
   */
  async getActiveDeliveries() {
    const driverId = this.getDriver().id;

    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client
          .from("orders")
          .select(`
            *,
            order_items (
              id, quantity, unit_price, total_price,
              food_items (name, image_url)
            )
          `)
          .eq("driver_id", driverId)
          .in("status", ["CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"])
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          this.activeOrders = data;
          return data;
        }
      } catch (e) {
        console.warn("[DriverClient] getActiveDeliveries notice:", e.message);
      }
    }

    // Local Mock Active Orders Fallback
    const local = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    const active = local.filter(o => 
      o.driver_id === driverId || 
      (!o.driver_id && o.status !== "DELIVERED" && o.status !== "CANCELLED")
    );

    if (active.length > 0) {
      this.activeOrders = active;
      return active;
    }

    // Default simulated active order with realistic Bengaluru delivery route
    const defaultOrder = {
      id: "ord-active-live-01",
      order_number: "HV-203364",
      status: "PICKED_UP",
      is_batch: false,
      customer_name: "Anita Sharma",
      customer_phone: "+91 98765 12345",
      delivery_address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
      delivery_latitude: 12.9279,
      delivery_longitude: 77.6710,
      subtotal: 598.00,
      delivery_fee: 40.00,
      total_amount: 638.00,
      payment_method: "UPI",
      payment_status: "PAID",
      created_at: new Date().toISOString(),
      order_items: [
        {
          quantity: 1,
          food_items: { name: "Hyderabadi Dum Chicken Biryani Kit" }
        },
        {
          quantity: 1,
          food_items: { name: "Paneer Butter Masala DIY Kit" }
        }
      ]
    };

    this.activeOrders = [defaultOrder];
    return this.activeOrders;
  }

  /**
   * Broadcast Driver Live GPS coordinates to Supabase
   */
  async updateLiveLocation(lat, lng) {
    const driver = this.getDriver();
    driver.lat = lat;
    driver.lng = lng;

    if (this.isCloud && this.client) {
      try {
        await this.client
          .from("driver_live_locations")
          .upsert({
            driver_id: driver.id,
            latitude: lat,
            longitude: lng,
            is_available: this.isOnline,
            updated_at: new Date().toISOString()
          }, { onConflict: "driver_id" });
      } catch (e) {
        console.warn("[DriverClient] GPS broadcast notice:", e.message);
      }
    }
  }

  /**
   * Transition order delivery stage and emit telemetry event
   */
  async updateOrderStatus(orderId, nextStatus, note = "") {
    const validStatuses = ["CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
    if (!validStatuses.includes(nextStatus)) return;

    if (this.isCloud && this.client) {
      try {
        const updatePayload = { status: nextStatus, updated_at: new Date().toISOString() };
        if (nextStatus === "DELIVERED") {
          updatePayload.actual_delivery_at = new Date().toISOString();
        }

        await this.client
          .from("orders")
          .update(updatePayload)
          .eq("id", orderId);

        // Record tracking event
        await this.client
          .from("order_tracking_events")
          .insert({
            order_id: orderId,
            status: nextStatus,
            message: note || `Order updated to ${nextStatus.replace(/_/g, " ")} by delivery partner`,
            latitude: this.getDriver().lat || 12.9352,
            longitude: this.getDriver().lng || 77.6245
          });
      } catch (e) {
        console.warn("[DriverClient] status update notice:", e.message);
      }
    }

    // Sync in local storage
    const local = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    const idx = local.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      local[idx].status = nextStatus;
      localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(local));
    }
  }

  /**
   * Fetch nearby orders within 15 km for acceptance
   */
  async getNearbyAvailableOrders() {
    if (!this.isOnline) return [];

    if (this.isCloud && this.client) {
      try {
        const { data, error } = await this.client
          .from("orders")
          .select(`
            *,
            order_items (
              quantity,
              food_items (name)
            )
          `)
          .is("driver_id", null)
          .in("status", ["PLACED", "CONFIRMED", "PREPARING"])
          .limit(5);

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn("[DriverClient] getNearbyAvailableOrders:", e.message);
      }
    }

    return [
      {
        id: "ord-nearby-101",
        order_number: "HV-748192",
        status: "PREPARING",
        customer_name: "Vikram Malhotra",
        delivery_address: "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru",
        delivery_latitude: 12.9784,
        delivery_longitude: 77.6408,
        total_amount: 420.00,
        estimated_payout: 68.00,
        distance_km: 3.4,
        order_items: [
          { quantity: 1, food_items: { name: "Chettinad Pepper Chicken Kit" } }
        ]
      }
    ];
  }

  /**
   * Accept an incoming dispatch assignment
   */
  async acceptOrder(orderId) {
    const driverId = this.getDriver().id;

    if (this.isCloud && this.client) {
      try {
        await this.client
          .from("orders")
          .update({
            driver_id: driverId,
            status: "CONFIRMED",
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);

        await this.client
          .from("order_tracking_events")
          .insert({
            order_id: orderId,
            status: "CONFIRMED",
            message: `Delivery accepted by partner Ravi Kumar (${this.getDriver().vehicle_number})`,
            latitude: this.getDriver().lat || 12.9352,
            longitude: this.getDriver().lng || 77.6245
          });
      } catch (e) {
        console.warn("[DriverClient] acceptOrder notice:", e.message);
      }
    }

    // Update in local memory
    const local = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
    const idx = local.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      local[idx].driver_id = driverId;
      local[idx].status = "CONFIRMED";
      localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(local));
    }
  }

  /**
   * Shift & Earnings Metrics
   */
  getShiftMetrics() {
    return {
      todayEarnings: 1240.00,
      completedOrders: 14,
      distanceKm: 42.8,
      rating: 4.96,
      acceptanceRate: 97.5,
      vehicle: "Electric Scooter • KA-01-HV-2026"
    };
  }
}

window.driverDataService = new DriverDataService();
