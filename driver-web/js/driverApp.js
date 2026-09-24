/**
 * HomeVibes Driver Web — Main Application Controller
 * Handles UI interactions, tab switching, order progression, and radar alerts.
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[DriverApp] Initializing HomeVibes Driver Companion Web...");

  // State
  let currentActiveOrder = null;
  let radarTimer = null;
  let radarCountdownSeconds = 30;

  // DOM Elements
  const navLinks = document.querySelectorAll(".nav-link[data-tab]");
  const tabPanes = document.querySelectorAll(".tab-pane");

  const dutyOnlineBtn = document.getElementById("dutyOnlineBtn");
  const dutyOfflineBtn = document.getElementById("dutyOfflineBtn");
  const statusDot = document.getElementById("topStatusDot");

  const orderIdText = document.getElementById("orderIdText");
  const orderStatusPill = document.getElementById("orderStatusPill");
  const customerNameText = document.getElementById("customerNameText");
  const customerPhoneBtn = document.getElementById("customerPhoneBtn");
  const customerAddressText = document.getElementById("customerAddressText");
  const kitItemsContainer = document.getElementById("kitItemsContainer");

  const btnProgressStatus = document.getElementById("btnProgressStatus");
  const btnToggleNav = document.getElementById("btnToggleNav");
  const btnExternalMaps = document.getElementById("btnExternalMaps");
  const btnCenterDriver = document.getElementById("btnCenterDriver");
  const btnFitRoute = document.getElementById("btnFitRoute");

  const routeSelectHub = document.getElementById("routeSelectHub");
  const routeSelectCustomer = document.getElementById("routeSelectCustomer");
  const routeSelectFull = document.getElementById("routeSelectFull");

  // Radar Elements
  const radarModal = document.getElementById("radarModal");
  const radarOrderId = document.getElementById("radarOrderId");
  const radarTimerText = document.getElementById("radarTimerText");
  const radarTimerProgress = document.getElementById("radarTimerProgress");
  const radarPayout = document.getElementById("radarPayout");
  const radarDistance = document.getElementById("radarDistance");
  const radarAddress = document.getElementById("radarAddress");
  const radarItems = document.getElementById("radarItems");
  const btnAcceptRadar = document.getElementById("btnAcceptRadar");
  const btnDeclineRadar = document.getElementById("btnDeclineRadar");

  // 1. Initialize Map Routing Engine
  window.driverRouting.initMap("driverRouteMap");

  // 2. Load Driver Profile & Active Deliveries
  await loadDriverWorkflow();

  // 3. Setup Navigation Tabs
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetTab = link.getAttribute("data-tab");
      navLinks.forEach(l => l.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      link.classList.add("active");
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add("active");

      if (targetTab === "tabRouting" && window.driverRouting.map) {
        setTimeout(() => window.driverRouting.map.invalidateSize(), 150);
      }
    });
  });

  // 4. Duty Online / Offline Toggles
  if (dutyOnlineBtn && dutyOfflineBtn) {
    dutyOnlineBtn.addEventListener("click", () => {
      dutyOnlineBtn.classList.add("active", "online");
      dutyOfflineBtn.classList.remove("active");
      statusDot.className = "status-dot online";
      window.driverDataService.setOnlineStatus(true);
      showToast("You are now ONLINE. Scanning orders within 15 km", "success");
      checkNearbyRadarOrders();
    });

    dutyOfflineBtn.addEventListener("click", () => {
      dutyOfflineBtn.classList.add("active");
      dutyOnlineBtn.classList.remove("active", "online");
      statusDot.className = "status-dot";
      window.driverDataService.setOnlineStatus(false);
      showToast("You are now OFFLINE. Radar paused", "info");
    });
  }

  // 5. Route Mode Selectors
  if (routeSelectHub) {
    routeSelectHub.addEventListener("click", async () => {
      setActiveRouteBtn(routeSelectHub);
      await window.driverRouting.setRouteMode("TO_HUB");
      showToast("Route updated: Navigating to Staging Hub", "info");
    });
  }

  if (routeSelectCustomer) {
    routeSelectCustomer.addEventListener("click", async () => {
      setActiveRouteBtn(routeSelectCustomer);
      await window.driverRouting.setRouteMode("TO_CUSTOMER");
      showToast("Route updated: Navigating to Customer", "info");
    });
  }

  if (routeSelectFull) {
    routeSelectFull.addEventListener("click", async () => {
      setActiveRouteBtn(routeSelectFull);
      await window.driverRouting.setRouteMode("FULL");
      showToast("Full itinerary route overview displayed", "info");
    });
  }

  function setActiveRouteBtn(activeBtn) {
    [routeSelectHub, routeSelectCustomer, routeSelectFull].forEach(b => {
      if (b) b.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
  }

  // 6. Active Navigation Simulation Controls
  if (btnToggleNav) {
    btnToggleNav.addEventListener("click", () => {
      if (window.driverRouting.isNavigating) {
        window.driverRouting.stopNavigation();
        showToast("Turn-by-turn navigation paused", "info");
      } else {
        window.driverRouting.startNavigation((info) => {
          if (info.reachedDestination) {
            showToast("Destination waypoint reached!", "success");
            suggestNextStatusTransition();
          }
        });
        showToast("Live Turn-by-Turn GPS Navigation started", "success");
      }
    });
  }

  if (btnExternalMaps) {
    btnExternalMaps.addEventListener("click", () => {
      window.driverRouting.openExternalNavigation();
    });
  }

  if (btnCenterDriver) {
    btnCenterDriver.addEventListener("click", () => {
      if (window.driverRouting.map) {
        window.driverRouting.map.panTo(window.driverRouting.driverPos, { animate: true });
      }
    });
  }

  if (btnFitRoute) {
    btnFitRoute.addEventListener("click", () => {
      if (window.driverRouting.map && window.driverRouting.routePolyline) {
        window.driverRouting.map.fitBounds(window.driverRouting.routePolyline.getBounds(), { padding: [40, 40] });
      }
    });
  }

  const btnRerouteManual = document.getElementById("btnRerouteManual");
  if (btnRerouteManual) {
    btnRerouteManual.addEventListener("click", async () => {
      await window.driverRouting.recalculateDynamicRoute("manual");
      showToast("Route dynamically recalculated based on live road conditions", "success");
    });
  }

  // 7. Order Status Transitions & Progression
  if (btnProgressStatus) {
    btnProgressStatus.addEventListener("click", async () => {
      if (!currentActiveOrder) return;

      const current = currentActiveOrder.status || "CONFIRMED";
      let next = "PICKED_UP";
      let note = "";

      if (current === "CONFIRMED" || current === "PREPARING") {
        next = "PICKED_UP";
        note = "Driver verified temperature-safe meal kit seal and departed hub";
      } else if (current === "PICKED_UP") {
        next = "OUT_FOR_DELIVERY";
        note = "Driver is out for delivery with customer meal kits";
      } else if (current === "OUT_FOR_DELIVERY") {
        next = "DELIVERED";
        note = "Meal kit package safely delivered to customer";
      }

      btnProgressStatus.disabled = true;
      btnProgressStatus.textContent = "Updating Supabase...";

      await window.driverDataService.updateOrderStatus(currentActiveOrder.id, next, note);
      currentActiveOrder.status = next;

      renderActiveOrderUI(currentActiveOrder);
      btnProgressStatus.disabled = false;

      showToast(`Order status updated to ${next.replace(/_/g, " ")}`, "success");

      // Auto-switch navigation mode if advancing stages
      if (next === "PICKED_UP" || next === "OUT_FOR_DELIVERY") {
        setActiveRouteBtn(routeSelectCustomer);
        window.driverRouting.setRouteMode("TO_CUSTOMER");
      } else if (next === "DELIVERED") {
        showToast("Order completed! Payout ₹65.00 credited to wallet", "success");
        setTimeout(() => loadDriverWorkflow(), 2500);
      }
    });
  }

  // 8. 15 km Radar Modal Actions
  if (btnAcceptRadar) {
    btnAcceptRadar.addEventListener("click", async () => {
      const orderId = radarModal.dataset.orderId;
      clearInterval(radarTimer);
      radarModal.classList.remove("open");

      showToast("Order accepted! Routing to Koramangala Hub for pickup", "success");
      await window.driverDataService.acceptOrder(orderId);
      await loadDriverWorkflow();
    });
  }

  if (btnDeclineRadar) {
    btnDeclineRadar.addEventListener("click", () => {
      clearInterval(radarTimer);
      radarModal.classList.remove("open");
      showToast("Order pass acknowledged. Keeping you in priority dispatch queue", "info");
    });
  }

  // Helper Functions
  async function loadDriverWorkflow() {
    const orders = await window.driverDataService.getActiveDeliveries();
    if (orders && orders.length > 0) {
      currentActiveOrder = orders[0];
      renderActiveOrderUI(currentActiveOrder);

      // Pass coordinates to Routing engine
      if (currentActiveOrder.delivery_latitude && currentActiveOrder.delivery_longitude) {
        window.driverRouting.setDestination(
          currentActiveOrder.delivery_latitude,
          currentActiveOrder.delivery_longitude,
          currentActiveOrder.delivery_address || "Customer Delivery Address"
        );
      }

      // Automatically select appropriate leg
      if (currentActiveOrder.status === "PICKED_UP" || currentActiveOrder.status === "OUT_FOR_DELIVERY") {
        setActiveRouteBtn(routeSelectCustomer);
        window.driverRouting.setRouteMode("TO_CUSTOMER");
      } else {
        setActiveRouteBtn(routeSelectHub);
        window.driverRouting.setRouteMode("TO_HUB");
      }
    } else {
      currentActiveOrder = null;
      renderEmptyState();
    }

    renderShiftMetrics();
  }

  function renderActiveOrderUI(order) {
    if (!order) return;

    if (orderIdText) orderIdText.textContent = `Order #${order.order_number || (order.id ? order.id.slice(0, 8) : "--")}`;
    if (orderStatusPill) {
      const s = (order.status || "CONFIRMED").toLowerCase();
      orderStatusPill.className = `status-pill ${s}`;
      orderStatusPill.textContent = (order.status || "CONFIRMED").replace(/_/g, " ");
    }

    if (customerNameText) customerNameText.textContent = order.customer_name || "Customer";
    if (customerPhoneBtn) {
      customerPhoneBtn.href = `tel:${order.customer_phone || "+919876543210"}`;
    }
    if (customerAddressText) {
      customerAddressText.textContent = order.delivery_address || "Bengaluru Delivery Address";
    }

    // Render Items
    if (kitItemsContainer) {
      const items = order.order_items || [];
      if (items.length > 0) {
        kitItemsContainer.innerHTML = items.map(item => {
          const name = item.food_items ? item.food_items.name : "Authentic Meal Kit";
          const qty = item.quantity || 1;
          return `
            <div class="kit-item-row">
              <span class="kit-name">${name}</span>
              <span class="kit-qty">&times; ${qty}</span>
            </div>
          `;
        }).join("");
      } else {
        kitItemsContainer.innerHTML = `
          <div class="kit-item-row">
            <span class="kit-name">Fresh Meal Kit Package</span>
            <span class="kit-qty">&times; 1</span>
          </div>
        `;
      }
    }

    // Update Button Label
    if (btnProgressStatus) {
      const s = order.status || "CONFIRMED";
      if (s === "CONFIRMED" || s === "PREPARING") {
        btnProgressStatus.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Verify Kits & Confirm Hub Pickup</span>
        `;
      } else if (s === "PICKED_UP") {
        btnProgressStatus.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Depart Hub: Start Customer Delivery</span>
        `;
      } else if (s === "OUT_FOR_DELIVERY") {
        btnProgressStatus.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Confirm Safe Handover & Complete Delivery</span>
        `;
      } else {
        btnProgressStatus.innerHTML = `<span>Order Completed</span>`;
      }
    }
  }

  function renderEmptyState() {
    if (orderIdText) orderIdText.textContent = "No Active Delivery";
    if (orderStatusPill) {
      orderStatusPill.className = "status-pill";
      orderStatusPill.textContent = "STANDBY";
    }
    if (customerNameText) customerNameText.textContent = "Awaiting Assignment";
    if (customerAddressText) customerAddressText.textContent = "Stay in active dispatch zone around Koramangala Hub";
    if (btnProgressStatus) {
      btnProgressStatus.disabled = true;
      btnProgressStatus.innerHTML = "<span>Standby Mode</span>";
    }
  }

  function suggestNextStatusTransition() {
    if (!currentActiveOrder) return;
    if (currentActiveOrder.status === "PICKED_UP") {
      showToast("Arrived near customer destination! Tap 'Complete Delivery' upon handover", "info");
    }
  }

  function renderShiftMetrics() {
    const metrics = window.driverDataService.getShiftMetrics();
    const earningsEl = document.getElementById("metricEarnings");
    const countEl = document.getElementById("metricTrips");
    const distEl = document.getElementById("metricDistance");
    const ratingEl = document.getElementById("metricRating");

    if (earningsEl) earningsEl.textContent = `₹${metrics.todayEarnings.toFixed(2)}`;
    if (countEl) countEl.textContent = `${metrics.completedOrders}`;
    if (distEl) distEl.textContent = `${metrics.distanceKm} km`;
    if (ratingEl) ratingEl.textContent = `${metrics.rating} ★`;
  }

  async function checkNearbyRadarOrders() {
    if (!window.driverDataService.isOnline) return;

    const nearby = await window.driverDataService.getNearbyAvailableOrders();
    if (nearby && nearby.length > 0) {
      const order = nearby[0];
      triggerRadarAlert(order);
    }
  }

  function triggerRadarAlert(order) {
    if (!radarModal) return;

    radarModal.dataset.orderId = order.id;
    if (radarOrderId) radarOrderId.textContent = `Order #${order.order_number || (order.id ? order.id.slice(0, 8) : "--")}`;
    if (radarPayout) radarPayout.textContent = `₹${(order.estimated_payout || 68).toFixed(2)}`;
    if (radarDistance) radarDistance.textContent = `${order.distance_km || 3.4} km away`;
    if (radarAddress) radarAddress.textContent = order.delivery_address || "Bengaluru Delivery Address";

    if (radarItems) {
      const items = order.order_items || [];
      radarItems.textContent = items.length > 0
        ? items.map(i => `${i.food_items ? i.food_items.name : 'Meal Kit'} (x${i.quantity || 1})`).join(", ")
        : "Fresh DIY Meal Kit Box";
    }

    radarCountdownSeconds = 30;
    if (radarTimerText) radarTimerText.textContent = `${radarCountdownSeconds}s`;
    if (radarTimerProgress) radarTimerProgress.style.width = "100%";

    radarModal.classList.add("open");

    clearInterval(radarTimer);
    radarTimer = setInterval(() => {
      radarCountdownSeconds--;
      if (radarTimerText) radarTimerText.textContent = `${radarCountdownSeconds}s`;
      if (radarTimerProgress) {
        const pct = (radarCountdownSeconds / 30) * 100;
        radarTimerProgress.style.width = `${pct}%`;
      }

      if (radarCountdownSeconds <= 0) {
        clearInterval(radarTimer);
        radarModal.classList.remove("open");
      }
    }, 1000);
  }

  // Periodic Proximity Scan
  setInterval(() => {
    if (window.driverDataService.isOnline && !currentActiveOrder) {
      checkNearbyRadarOrders();
    }
  }, 12000);

  // Cross-tab real-time sync (Admin dispatches -> Driver receives alert instantly)
  window.addEventListener("storage", (e) => {
    if (e.key === "HOMEVIBES_MOCK_ORDERS" || e.key === "HOMEVIBES_DISPATCH_ALERT") {
      checkNearbyRadarOrders();
    }
  });

  // Supabase Realtime channel for live dispatch alerts
  if (window.driverDataService.isCloud && window.driverDataService.client) {
    try {
      window.driverDataService.client
        .channel("driver-dispatch-feed")
        .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, payload => {
          if (payload.new && payload.new.driver_id === window.driverDataService.getDriver().id && payload.new.status === "PENDING") {
            checkNearbyRadarOrders();
          }
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
          checkNearbyRadarOrders();
        })
        .subscribe();
    } catch (_) {}
  }

  // Toast Functionality
  function showToast(message, type = "info") {
    let container = document.getElementById("driverToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "driverToastContainer";
      container.className = "driver-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `driver-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }

  window.showDriverToast = showToast;
});
