/**
 * HomeVibes Admin Web — Main Dashboard Controller
 * Professional SaaS Operations Console
 * Currency: Indian Rupee (₹)
 * Strict Requirement: No emojis, clean typography, responsive layout
 */

document.addEventListener("DOMContentLoaded", () => {
  const AdminState = {
    orders: [],
    drivers: [],
    foodItems: [],
    statusFilter: "ALL",
    selectedOrderIdForAssign: null,
    selectedOrderIdForStatus: null
  };

  // DOM Elements
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = {
    secDashboard: document.getElementById("secDashboard"),
    secOrders: document.getElementById("secOrders"),
    secDrivers: document.getElementById("secDrivers"),
    secFood: document.getElementById("secFood"),
    secCloud: document.getElementById("secCloud")
  };
  const pageTitle = document.getElementById("pageTitle");

  // Metrics
  const metricRevenue = document.getElementById("metricRevenue");
  const metricActiveOrders = document.getElementById("metricActiveOrders");
  const metricOnlineDrivers = document.getElementById("metricOnlineDrivers");
  const metricCustomers = document.getElementById("metricCustomers");

  // Tables
  const dashboardOrdersTbody = document.getElementById("dashboardOrdersTbody");
  const ordersFullTbody = document.getElementById("ordersFullTbody");
  const driversTbody = document.getElementById("driversTbody");
  const foodInventoryTbody = document.getElementById("foodInventoryTbody");

  // Filters & Actions
  const btnRefreshOrders = document.getElementById("btnRefreshOrders");
  const btnViewAllOrders = document.getElementById("btnViewAllOrders");
  const btnSimulateOrder = document.getElementById("btnSimulateOrder");
  const btnOpenCloudModal = document.getElementById("btnOpenCloudModal");
  const orderSearchInput = document.getElementById("orderSearchInput");

  // Modals
  const assignDriverModal = document.getElementById("assignDriverModal");
  const closeAssignModal = document.getElementById("closeAssignModal");
  const cancelAssignBtn = document.getElementById("cancelAssignBtn");
  const confirmAssignBtn = document.getElementById("confirmAssignBtn");
  const selectDriverDropdown = document.getElementById("selectDriverDropdown");
  const assignOrderDetails = document.getElementById("assignOrderDetails");

  const updateStatusModal = document.getElementById("updateStatusModal");
  const closeStatusModal = document.getElementById("closeStatusModal");
  const cancelStatusBtn = document.getElementById("cancelStatusBtn");
  const confirmStatusBtn = document.getElementById("confirmStatusBtn");
  const selectNextStatus = document.getElementById("selectNextStatus");
  const adminToastContainer = document.getElementById("adminToastContainer");

  // Add Food Modal Elements
  const btnOpenAddFoodModal = document.getElementById("btnOpenAddFoodModal");
  const addFoodModal = document.getElementById("addFoodModal");
  const closeAddFoodModal = document.getElementById("closeAddFoodModal");
  const cancelAddFoodBtn = document.getElementById("cancelAddFoodBtn");
  const addFoodForm = document.getElementById("addFoodForm");
  const foodCategorySelect = document.getElementById("foodCategorySelect");
  const foodNameInput = document.getElementById("foodNameInput");
  const foodPriceInput = document.getElementById("foodPriceInput");
  const foodCookTime = document.getElementById("foodCookTime");
  const foodServings = document.getElementById("foodServings");
  const foodSpiceLevel = document.getElementById("foodSpiceLevel");
  const foodDescription = document.getElementById("foodDescription");
  const foodImageUrl = document.getElementById("foodImageUrl");
  const foodIngredients = document.getElementById("foodIngredients");

  // Admin Auth Gate Elements
  const adminAuthModal = document.getElementById("adminAuthModal");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminEmailInput = document.getElementById("adminEmailInput");
  const adminPasswordInput = document.getElementById("adminPasswordInput");
  const btnQuickLoginSeshank = document.getElementById("btnQuickLoginSeshank");
  const btnAdminLogout = document.getElementById("btnAdminLogout");
  const adminName = document.getElementById("adminName");
  const adminRoleText = document.getElementById("adminRoleText");
  const adminAvatarInitials = document.getElementById("adminAvatarInitials");

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  async function init() {
    setupNavigation();
    setupModals();
    setupAdminAuth();

    const currentAdmin = window.adminDataService.getCurrentAdmin();
    if (currentAdmin) {
      updateAdminProfileUI(currentAdmin);
      await loadDashboardData();
    } else {
      updateAdminProfileUI(null);
    }

    // Subscribe to live order updates
    window.adminDataService.subscribeToOrders(() => {
      if (window.adminDataService.getCurrentAdmin()) {
        refreshDashboard();
        loadOrders();
      }
    });
  }

  async function loadDashboardData() {
    await refreshDashboard();
    await loadOrders();
    await loadDrivers();
    await loadFoodInventory();
  }

  // ============================================================================
  // ADMIN AUTHENTICATION GATE
  // ============================================================================
  function updateAdminProfileUI(admin) {
    if (!admin) {
      if (adminName) adminName.textContent = "Guest";
      if (adminRoleText) adminRoleText.textContent = "Not Authenticated";
      if (adminAvatarInitials) adminAvatarInitials.textContent = "--";
      if (adminAuthModal) adminAuthModal.classList.add("open");
      return;
    }

    if (adminName) adminName.textContent = admin.name || "Seshank";
    if (adminRoleText) adminRoleText.textContent = `${admin.email} • Admin`;
    
    // Set Initials
    const initials = (admin.name || "SK")
      .split(" ")
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    if (adminAvatarInitials) adminAvatarInitials.textContent = initials || "SK";

    if (adminAuthModal) adminAuthModal.classList.remove("open");
  }

  function setupAdminAuth() {
    // Form Login
    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = adminEmailInput.value.trim();
        const password = adminPasswordInput.value;

        try {
          const admin = await window.adminDataService.login(email, password);
          updateAdminProfileUI(admin);
          await loadDashboardData();
          showAdminToast(`Authenticated as ${admin.name} (${admin.email})`);
        } catch (err) {
          alert("Authentication Failed: " + err.message);
        }
      });
    }

    // Quick Login as Seshank (Primary Admin)
    if (btnQuickLoginSeshank) {
      btnQuickLoginSeshank.addEventListener("click", async () => {
        try {
          const admin = await window.adminDataService.login("seshank5134@gmail.com", "");
          updateAdminProfileUI(admin);
          await loadDashboardData();
          showAdminToast("Welcome back, Seshank! Master Admin Privileges Granted.");
        } catch (err) {
          alert("Login error: " + err.message);
        }
      });
    }

    // Admin Logout
    if (btnAdminLogout) {
      btnAdminLogout.addEventListener("click", async () => {
        if (confirm("Sign out of HomeVibes Admin Operations?")) {
          await window.adminDataService.logout();
          updateAdminProfileUI(null);
          showAdminToast("Admin signed out.");
        }
      });
    }
  }

  // ============================================================================
  // NAVIGATION & SECTIONS
  // ============================================================================
  function setupNavigation() {
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        menuItems.forEach(m => m.classList.remove("active"));
        item.classList.add("active");

        const targetSection = item.dataset.section;
        Object.keys(sections).forEach(k => {
          sections[k].style.display = (k === targetSection) ? "block" : "none";
        });

        // Set topbar title
        switch (targetSection) {
          case "secDashboard": pageTitle.textContent = "Operations Dashboard"; break;
          case "secOrders": pageTitle.textContent = "Live Orders Queue"; break;
          case "secDrivers": pageTitle.textContent = "Delivery Fleet Partners"; break;
          case "secFood": pageTitle.textContent = "Meal Kits & Raw Materials Inventory"; break;
          case "secCloud": pageTitle.textContent = "Cloud Architecture & Viva Guide"; break;
        }
      });
    });

    if (btnViewAllOrders) {
      btnViewAllOrders.addEventListener("click", () => {
        document.querySelector('[data-section="secOrders"]').click();
      });
    }

    if (btnOpenCloudModal) {
      btnOpenCloudModal.addEventListener("click", () => {
        document.querySelector('[data-section="secCloud"]').click();
      });
    }
  }

  // ============================================================================
  // DASHBOARD METRICS
  // ============================================================================
  async function refreshDashboard() {
    const metrics = await window.adminDataService.getDashboardMetrics();
    metricRevenue.innerHTML = `&#8377;${metrics.revenue.toLocaleString("en-IN")}`;
    metricActiveOrders.textContent = metrics.activeOrders;
    metricOnlineDrivers.textContent = metrics.onlineDrivers;
    metricCustomers.textContent = metrics.totalCustomers;
  }

  // ============================================================================
  // ORDERS DISPATCH & MANAGEMENT
  // ============================================================================
  async function loadOrders() {
    AdminState.orders = await window.adminDataService.getOrders(AdminState.statusFilter);
    renderDashboardOrders();
    renderFullOrdersTable();
  }

  function renderDashboardOrders() {
    dashboardOrdersTbody.innerHTML = "";
    const previewList = AdminState.orders.slice(0, 5);

    if (previewList.length === 0) {
      dashboardOrdersTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No orders currently active in dispatch queue.</td></tr>`;
      return;
    }

    previewList.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700;">#${o.order_number || o.id.slice(0, 8)}</td>
        <td>${o.customer_name || o.profiles?.name || 'Customer'}</td>
        <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${o.delivery_address}</td>
        <td style="font-weight:700;">&#8377;${Number(o.total_amount).toFixed(0)}</td>
        <td>${getStatusPill(o.status)}</td>
        <td>${o.driver_name || o.drivers?.profiles?.name || '<span style="color:var(--text-dim);">Unassigned</span>'}</td>
        <td>
          <button class="btn btn-secondary btn-sm action-btn" data-id="${o.id}">Update</button>
        </td>
      `;

      tr.querySelector(".action-btn").addEventListener("click", () => {
        openStatusModal(o);
      });

      dashboardOrdersTbody.appendChild(tr);
    });
  }

  function renderFullOrdersTable() {
    ordersFullTbody.innerHTML = "";

    let filtered = AdminState.orders;
    if (orderSearchInput && orderSearchInput.value.trim()) {
      const q = orderSearchInput.value.trim().toLowerCase();
      filtered = filtered.filter(o => 
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.delivery_address && o.delivery_address.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      ordersFullTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">No orders match the filter criteria.</td></tr>`;
      return;
    }

    filtered.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700;">#${o.order_number || o.id.slice(0, 8)}</td>
        <td>
          <div style="font-weight:600;">${o.customer_name || o.profiles?.name || 'Customer'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${o.customer_phone || o.profiles?.phone || ''}</div>
        </td>
        <td style="max-width:220px; font-size:0.82rem; color:var(--text-muted);">${o.delivery_address}</td>
        <td style="font-weight:700;">&#8377;${Number(o.total_amount).toFixed(0)}</td>
        <td>${getStatusPill(o.status)}</td>
        <td>
          ${o.driver_name || o.drivers?.profiles?.name 
            ? `<span style="font-weight:600; color:var(--text-main);">${o.driver_name || o.drivers?.profiles?.name}</span>`
            : `
              <div style="display:flex; gap:6px;">
                <button class="btn btn-primary btn-sm btn-assign" data-id="${o.id}">Assign</button>
                <button class="btn btn-secondary btn-sm btn-quick-dispatch" data-id="${o.id}" style="font-size:0.75rem; padding:4px 8px;" title="Push 15km cloud dispatch alert to nearby drivers">Auto-Dispatch</button>
              </div>
            `}
        </td>
        <td>
          <button class="btn btn-secondary btn-sm btn-status" data-id="${o.id}">Advance Status</button>
        </td>
      `;

      const assignBtn = tr.querySelector(".btn-assign");
      if (assignBtn) {
        assignBtn.addEventListener("click", () => openAssignModal(o));
      }

      const quickDispatchBtn = tr.querySelector(".btn-quick-dispatch");
      if (quickDispatchBtn) {
        quickDispatchBtn.addEventListener("click", async () => {
          quickDispatchBtn.disabled = true;
          quickDispatchBtn.textContent = "Pushing...";
          await window.adminDataService.broadcastOrderDispatch(o.id);
          showAdminToast(`Dispatched alert to drivers within 15 km of ${o.delivery_address?.split(',')[0] || 'destination'}`);
          await loadOrders();
          await refreshDashboard();
        });
      }

      tr.querySelector(".btn-status").addEventListener("click", () => openStatusModal(o));

      ordersFullTbody.appendChild(tr);
    });
  }

  function getStatusPill(status) {
    const s = (status || "").toLowerCase();
    let label = s.replace(/_/g, " ");
    return `<span class="status-pill ${s}">${label}</span>`;
  }

  // ============================================================================
  // DRIVER FLEET
  // ============================================================================
  async function loadDrivers() {
    try {
      AdminState.drivers = await window.adminDataService.getDrivers();
    } catch (err) {
      console.warn("Could not load drivers from cloud:", err);
      AdminState.drivers = window.adminDataService.getDefaultDrivers();
    }

    if (!AdminState.drivers || AdminState.drivers.length === 0) {
      AdminState.drivers = window.adminDataService.getDefaultDrivers();
    }

    const fleetSummaryLabel = document.getElementById("fleetSummaryLabel");
    if (fleetSummaryLabel) {
      fleetSummaryLabel.textContent = `${AdminState.drivers.length} Drivers Active`;
    }

    if (!driversTbody) return;
    driversTbody.innerHTML = "";

    AdminState.drivers.forEach(d => {
      const tr = document.createElement("tr");
      const isOnline = d.is_online !== false;
      const driverName = d.name || d.profiles?.name || (d.vehicle_number ? `Fleet Partner (${d.vehicle_number})` : "Ravi Kumar");
      const driverPhone = d.phone || d.profiles?.phone || "+91 98765 43211";
      const vehicleType = d.vehicle_type || "Electric Scooter";
      const vehicleNumber = d.vehicle_number || "KA-01-HV-2026";
      const lat = d.current_latitude ? Number(d.current_latitude).toFixed(4) : "12.9716";
      const lng = d.current_longitude ? Number(d.current_longitude).toFixed(4) : "77.5946";
      const trips = d.total_deliveries ?? 48;
      const rating = (Number(d.rating) || 4.96).toFixed(1);

      tr.innerHTML = `
        <td style="font-weight:600;">
          ${driverName}
          <div style="font-size:0.75rem; color:var(--text-muted);">${driverPhone}</div>
        </td>
        <td>${vehicleType} (${vehicleNumber})</td>
        <td>
          <span class="status-pill ${isOnline ? 'delivered' : 'placed'}">
            ${isOnline ? 'Online' : 'Offline'}
          </span>
        </td>
        <td style="font-family:monospace; font-size:0.78rem; color:var(--text-muted);">
          ${lat}, ${lng}
        </td>
        <td style="font-weight:700;">${trips}</td>
        <td style="font-weight:700; color:var(--text-main);">${rating} / 5.0</td>
      `;
      driversTbody.appendChild(tr);
    });
  }

  // ============================================================================
  // FOOD / MEAL KITS INVENTORY
  // ============================================================================
  async function loadFoodInventory() {
    AdminState.foodItems = await window.adminDataService.getFoodItems();
    foodInventoryTbody.innerHTML = "";

    AdminState.foodItems.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image_url}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid var(--card-border);">
            <div>
              <div style="font-weight:700;">${item.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${item.description}
              </div>
            </div>
          </div>
        </td>
        <td><span style="font-size:0.8rem; color:var(--text-muted);">${item.categories?.name || 'Meal Kit'}</span></td>
        <td style="font-weight:700;">&#8377;${Number(item.price).toFixed(0)}</td>
        <td>${item.cook_time_minutes || 20} mins</td>
        <td><span class="status-pill placed">${item.spice_level || 'Medium'}</span></td>
        <td>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" class="stock-toggle" data-id="${item.id}" ${item.is_available ? 'checked' : ''}>
            <span style="font-size:0.8rem; font-weight:600; color:${item.is_available ? 'var(--success)' : 'var(--text-muted)'};">
              ${item.is_available ? 'Available' : 'Paused'}
            </span>
          </label>
        </td>
      `;

      tr.querySelector(".stock-toggle").addEventListener("change", async (e) => {
        const isChecked = e.target.checked;
        await window.adminDataService.toggleFoodAvailability(item.id, isChecked);
        e.target.nextElementSibling.textContent = isChecked ? 'Available' : 'Paused';
        e.target.nextElementSibling.style.color = isChecked ? 'var(--success)' : 'var(--text-muted)';
        showAdminToast(`Updated availability for ${item.name}`);
      });

      foodInventoryTbody.appendChild(tr);
    });
  }

  // ============================================================================
  // MODALS LOGIC
  // ============================================================================
  function setupModals() {
    if (btnRefreshOrders) {
      btnRefreshOrders.addEventListener("click", () => {
        loadOrders();
        showAdminToast("Orders queue refreshed");
      });
    }

    if (orderSearchInput) {
      orderSearchInput.addEventListener("input", () => renderFullOrdersTable());
    }

    // Driver Assign Modal
    closeAssignModal.addEventListener("click", () => assignDriverModal.classList.remove("open"));
    cancelAssignBtn.addEventListener("click", () => assignDriverModal.classList.remove("open"));
    confirmAssignBtn.addEventListener("click", async () => {
      const driverId = selectDriverDropdown.value;
      if (AdminState.selectedOrderIdForAssign && driverId) {
        await window.adminDataService.assignDriver(AdminState.selectedOrderIdForAssign, driverId);
        assignDriverModal.classList.remove("open");
        await loadOrders();
        await refreshDashboard();
        showAdminToast("Fleet partner assigned to dispatch order");
      }
    });

    const btnBroadcastDispatch = document.getElementById("btnBroadcastDispatch");
    if (btnBroadcastDispatch) {
      btnBroadcastDispatch.addEventListener("click", async () => {
        if (!AdminState.selectedOrderIdForAssign) return;
        btnBroadcastDispatch.disabled = true;
        btnBroadcastDispatch.textContent = "Broadcasting to 15km drivers...";
        await window.adminDataService.broadcastOrderDispatch(AdminState.selectedOrderIdForAssign);
        assignDriverModal.classList.remove("open");
        btnBroadcastDispatch.disabled = false;
        btnBroadcastDispatch.innerHTML = "<span>Push 15km Dispatch Notification to Drivers</span>";
        await loadOrders();
        await refreshDashboard();
        showAdminToast("Dispatched assignment alert to nearest available drivers within 15 km");
      });
    }

    const btnTopbarAutoDispatch = document.getElementById("btnTopbarAutoDispatch");
    if (btnTopbarAutoDispatch) {
      btnTopbarAutoDispatch.addEventListener("click", async () => {
        btnTopbarAutoDispatch.disabled = true;
        btnTopbarAutoDispatch.textContent = "Dispatching...";
        const unassigned = (AdminState.orders || []).filter(o => !o.driver_id && o.status !== "DELIVERED" && o.status !== "CANCELLED");
        if (unassigned.length === 0) {
          showAdminToast("All current orders already have assigned delivery partners");
        } else {
          for (const ord of unassigned) {
            await window.adminDataService.broadcastOrderDispatch(ord.id);
          }
          showAdminToast(`Broadcasted 15km dispatch requests for ${unassigned.length} pending orders`);
        }
        btnTopbarAutoDispatch.disabled = false;
        btnTopbarAutoDispatch.innerHTML = "<span>Auto-Dispatch All (15km)</span>";
        await loadOrders();
        await refreshDashboard();
      });
    }

    // Status Advance Modal
    closeStatusModal.addEventListener("click", () => updateStatusModal.classList.remove("open"));
    cancelStatusBtn.addEventListener("click", () => updateStatusModal.classList.remove("open"));
    confirmStatusBtn.addEventListener("click", async () => {
      const nextStatus = selectNextStatus.value;
      if (AdminState.selectedOrderIdForStatus && nextStatus) {
        await window.adminDataService.updateOrderStatus(AdminState.selectedOrderIdForStatus, nextStatus);
        updateStatusModal.classList.remove("open");
        await loadOrders();
        await refreshDashboard();
        showAdminToast(`Order advanced to status: ${nextStatus}`);
      }
    });

    // Simulate New Order
    if (btnSimulateOrder) {
      btnSimulateOrder.addEventListener("click", async () => {
        const sampleOrder = {
          id: "ord-sim-" + Date.now(),
          order_number: "HV-" + Math.floor(100000 + Math.random() * 900000),
          customer_name: "Kavya Patel",
          customer_phone: "+91 98765 43217",
          status: "placed",
          subtotal: 598.00,
          delivery_fee: 40.00,
          total_amount: 638.00,
          delivery_address: "Church Street, Ashok Nagar, Bengaluru",
          payment_method: "UPI",
          created_at: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
        existing.unshift(sampleOrder);
        localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(existing));

        await loadOrders();
        await refreshDashboard();
        showAdminToast(`Simulated new incoming order #${sampleOrder.order_number}`);
      });
    }

    // Add Meal Kit Modal Handlers
    if (btnOpenAddFoodModal) {
      btnOpenAddFoodModal.addEventListener("click", async () => {
        try {
          const categories = await window.adminDataService.getCategories();
          if (foodCategorySelect) {
            foodCategorySelect.innerHTML = (categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join("");
          }
          if (addFoodModal) {
            addFoodModal.classList.add("open");
          }
        } catch (e) {
          console.warn("[Admin] Open add food modal:", e.message);
        }
      });
    }

    if (closeAddFoodModal) {
      closeAddFoodModal.addEventListener("click", () => addFoodModal && addFoodModal.classList.remove("open"));
    }
    if (cancelAddFoodBtn) {
      cancelAddFoodBtn.addEventListener("click", () => addFoodModal && addFoodModal.classList.remove("open"));
    }

    if (addFoodForm) {
      addFoodForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("saveFoodBtn");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Saving to Catalogue...";
        }

        try {
          const name = foodNameInput.value.trim();
          const category_id = foodCategorySelect.value;
          const price = Number(foodPriceInput.value);
          const cook_time_minutes = Number(foodCookTime.value) || 20;
          const servings = Number(foodServings.value) || 2;
          const spice_level = foodSpiceLevel.value;
          const description = foodDescription.value.trim();
          const image_url = (foodImageUrl.value.trim()) || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80";
          const rawIngredientsText = foodIngredients.value.trim();
          const raw_ingredients = rawIngredientsText ? rawIngredientsText.split(",").map(s => s.trim()).filter(Boolean) : [];

          const newFoodItem = {
            name,
            category_id,
            price,
            cook_time_minutes,
            servings,
            spice_level,
            description,
            image_url,
            raw_ingredients,
            is_available: true,
            is_featured: false,
            rating: 5.0,
            rating_count: 1
          };

          await window.adminDataService.saveFoodItem(newFoodItem);
          addFoodModal.classList.remove("open");
          addFoodForm.reset();
          await loadFoodInventory();
          await refreshDashboard();
          showAdminToast(`Successfully added "${name}" to Meal Kits catalogue!`);
        } catch (err) {
          alert("Error saving meal kit: " + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Meal Kit";
          }
        }
      });
    }
  }

  function openAssignModal(order) {
    AdminState.selectedOrderIdForAssign = order.id;
    assignOrderDetails.textContent = `Order #${order.order_number || order.id.slice(0, 8)} • Total: ₹${Number(order.total_amount).toFixed(0)} • Destination: ${order.delivery_address}`;

    selectDriverDropdown.innerHTML = AdminState.drivers
      .filter(d => d.is_online)
      .map(d => `<option value="${d.id}">${d.name || d.profiles?.name} (${d.vehicle_type})</option>`)
      .join("");

    if (selectDriverDropdown.options.length === 0) {
      selectDriverDropdown.innerHTML = `<option value="">No drivers currently online</option>`;
      confirmAssignBtn.disabled = true;
    } else {
      confirmAssignBtn.disabled = false;
    }

    assignDriverModal.classList.add("open");
  }

  function openStatusModal(order) {
    AdminState.selectedOrderIdForStatus = order.id;
    updateStatusModal.classList.add("open");
  }

  function showAdminToast(msg) {
    if (!adminToastContainer) return;
    const toast = document.createElement("div");
    toast.className = "admin-toast";
    toast.textContent = msg;
    adminToastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Initialize
  init();
});
