/**
 * HomeVibes Admin Web — Main Dashboard Controller
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
  const filterTabs = document.querySelectorAll(".filter-tab");
  const btnRefreshOrders = document.getElementById("btnRefreshOrders");
  const btnViewAllOrders = document.getElementById("btnViewAllOrders");
  const btnSimulateOrder = document.getElementById("btnSimulateOrder");
  const btnOpenCloudModal = document.getElementById("btnOpenCloudModal");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");

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

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  async function init() {
    setupNavigation();
    setupModals();

    await refreshDashboard();
    await loadOrders();
    await loadDrivers();
    await loadFoodInventory();

    // Subscribe to live order updates
    window.adminDataService.subscribeToOrders(() => {
      refreshDashboard();
      loadOrders();
    });
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
          case "secOrders": pageTitle.textContent = "Live Orders Management"; break;
          case "secDrivers": pageTitle.textContent = "Delivery Fleet Partners"; break;
          case "secFood": pageTitle.textContent = "Food Catalogue & Inventory"; break;
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

    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener("click", async () => {
        await window.adminDataService.logout();
        alert("Logged out of Admin Portal.");
      });
    }
  }

  // ============================================================================
  // DASHBOARD METRICS
  // ============================================================================
  async function refreshDashboard() {
    const metrics = await window.adminDataService.getDashboardMetrics();
    metricRevenue.textContent = `$${metrics.revenue.toFixed(2)}`;
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
      dashboardOrdersTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No orders currently active.</td></tr>`;
      return;
    }

    previewList.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; font-family:var(--font-display);">#${o.order_number}</td>
        <td>${o.customer_name || o.profiles?.name || 'Customer'}</td>
        <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${o.delivery_address}</td>
        <td style="font-weight:700;">$${Number(o.total_amount).toFixed(2)}</td>
        <td>${getStatusBadge(o.status)}</td>
        <td>${o.driver_name || o.drivers?.profiles?.name || '<span style="color:var(--text-dim);">Unassigned</span>'}</td>
        <td>
          <button class="btn btn-secondary btn-sm action-btn" data-id="${o.id}">Manage</button>
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

    if (AdminState.orders.length === 0) {
      ordersFullTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">No orders match the selected filter.</td></tr>`;
      return;
    }

    AdminState.orders.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; font-family:var(--font-display);">#${o.order_number}</td>
        <td>
          <div>${o.customer_name || o.profiles?.name || 'Customer'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${o.customer_phone || o.profiles?.phone || ''}</div>
        </td>
        <td style="max-width:220px; font-size:0.85rem; color:var(--text-muted);">${o.delivery_address}</td>
        <td style="font-weight:700;">$${Number(o.total_amount).toFixed(2)}</td>
        <td>${getStatusBadge(o.status)}</td>
        <td>
          ${o.driver_name || o.drivers?.profiles?.name 
            ? `<span style="color:#10b981;">🛵 ${o.driver_name || o.drivers?.profiles?.name}</span>`
            : `<button class="btn btn-primary btn-sm btn-assign" data-id="${o.id}">+ Assign Driver</button>`}
        </td>
        <td>
          <button class="btn btn-secondary btn-sm btn-status" data-id="${o.id}">Update Status</button>
        </td>
      `;

      const assignBtn = tr.querySelector(".btn-assign");
      if (assignBtn) {
        assignBtn.addEventListener("click", () => openAssignModal(o));
      }

      tr.querySelector(".btn-status").addEventListener("click", () => openStatusModal(o));

      ordersFullTbody.appendChild(tr);
    });
  }

  function getStatusBadge(status) {
    let cls = "badge-placed";
    if (status === "CONFIRMED") cls = "badge-confirmed";
    if (status === "PREPARING") cls = "badge-preparing";
    if (status === "READY_FOR_PICKUP") cls = "badge-ready";
    if (status === "DRIVER_ASSIGNED") cls = "badge-assigned";
    if (status === "OUT_FOR_DELIVERY") cls = "badge-out";
    if (status === "DELIVERED") cls = "badge-delivered";
    if (status === "CANCELLED") cls = "badge-cancelled";

    return `<span class="badge ${cls}">${status.replaceAll('_', ' ')}</span>`;
  }

  // ============================================================================
  // DRIVER FLEET
  // ============================================================================
  async function loadDrivers() {
    AdminState.drivers = await window.adminDataService.getDrivers();
    driversTbody.innerHTML = "";

    AdminState.drivers.forEach(d => {
      const tr = document.createElement("tr");
      const isOnline = d.is_online;
      tr.innerHTML = `
        <td style="font-weight:600;">
          ${d.name || d.profiles?.name}
          <div style="font-size:0.75rem; color:var(--text-muted);">${d.phone || d.profiles?.phone || ''}</div>
        </td>
        <td>${d.vehicle_type} (${d.vehicle_number || 'Standard'})</td>
        <td>
          <span class="badge ${isOnline ? 'badge-delivered' : 'badge-cancelled'}">
            ${isOnline ? '● ONLINE' : '○ OFFLINE'}
          </span>
        </td>
        <td style="font-family:monospace; font-size:0.8rem; color:var(--text-muted);">
          ${d.current_latitude ? `${d.current_latitude.toFixed(4)}, ${d.current_longitude.toFixed(4)}` : 'Location unavailable'}
        </td>
        <td style="font-weight:700;">${d.total_deliveries}</td>
        <td style="color:#f59e0b; font-weight:700;">⭐ ${(d.rating || 5.0).toFixed(1)}</td>
      `;
      driversTbody.appendChild(tr);
    });
  }

  // ============================================================================
  // FOOD INVENTORY
  // ============================================================================
  async function loadFoodInventory() {
    AdminState.foodItems = await window.adminDataService.getFoodItems();
    foodInventoryTbody.innerHTML = "";

    AdminState.foodItems.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${item.image_url}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
            <div>
              <div style="font-weight:700;">${item.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${item.description}
              </div>
            </div>
          </div>
        </td>
        <td><span style="font-size:0.8rem; color:var(--text-muted);">${item.categories?.name || 'Delicacy'}</span></td>
        <td style="font-weight:700; font-family:var(--font-display);">$${Number(item.price).toFixed(2)}</td>
        <td>⏱️ ${item.prep_time_minutes || 20}m</td>
        <td style="color:#f59e0b; font-weight:600;">⭐ ${(item.rating || 5.0).toFixed(1)}</td>
        <td>
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" class="stock-toggle" data-id="${item.id}" ${item.is_available ? 'checked' : ''}>
            <span style="font-size:0.8rem; color:${item.is_available ? '#10b981' : '#64748b'};">
              ${item.is_available ? 'In Stock' : 'Disabled'}
            </span>
          </label>
        </td>
      `;

      tr.querySelector(".stock-toggle").addEventListener("change", async (e) => {
        const isChecked = e.target.checked;
        await window.adminDataService.toggleFoodAvailability(item.id, isChecked);
        e.target.nextElementSibling.textContent = isChecked ? 'In Stock' : 'Disabled';
        e.target.nextElementSibling.style.color = isChecked ? '#10b981' : '#64748b';
      });

      foodInventoryTbody.appendChild(tr);
    });
  }

  // ============================================================================
  // MODALS LOGIC
  // ============================================================================
  function setupModals() {
    // Filter Tabs
    filterTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        filterTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        AdminState.statusFilter = tab.dataset.status;
        loadOrders();
      });
    });

    if (btnRefreshOrders) {
      btnRefreshOrders.addEventListener("click", () => loadOrders());
    }

    // Driver Assign Modal
    closeAssignModal.addEventListener("click", () => assignDriverModal.classList.remove("active"));
    cancelAssignBtn.addEventListener("click", () => assignDriverModal.classList.remove("active"));
    confirmAssignBtn.addEventListener("click", async () => {
      const driverId = selectDriverDropdown.value;
      if (AdminState.selectedOrderIdForAssign && driverId) {
        await window.adminDataService.assignDriver(AdminState.selectedOrderIdForAssign, driverId);
        assignDriverModal.classList.remove("active");
        await loadOrders();
        await refreshDashboard();
      }
    });

    // Status Advance Modal
    closeStatusModal.addEventListener("click", () => updateStatusModal.classList.remove("active"));
    cancelStatusBtn.addEventListener("click", () => updateStatusModal.classList.remove("active"));
    confirmStatusBtn.addEventListener("click", async () => {
      const nextStatus = selectNextStatus.value;
      if (AdminState.selectedOrderIdForStatus && nextStatus) {
        await window.adminDataService.updateOrderStatus(AdminState.selectedOrderIdForStatus, nextStatus);
        updateStatusModal.classList.remove("active");
        await loadOrders();
        await refreshDashboard();
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
          status: "PLACED",
          subtotal: 31.98,
          delivery_fee: 2.50,
          total_amount: 34.48,
          delivery_address: "Church Street, Ashok Nagar, Bengaluru",
          payment_method: "CASH_ON_DELIVERY",
          created_at: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
        existing.unshift(sampleOrder);
        localStorage.setItem("HOMEVIBES_MOCK_ORDERS", JSON.stringify(existing));

        await loadOrders();
        await refreshDashboard();
        alert(`New order #${sampleOrder.order_number} received from Kavya Patel!`);
      });
    }
  }

  function openAssignModal(order) {
    AdminState.selectedOrderIdForAssign = order.id;
    assignOrderDetails.textContent = `Order #${order.order_number} • Total: $${Number(order.total_amount).toFixed(2)} • Destination: ${order.delivery_address}`;

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

    assignDriverModal.classList.add("active");
  }

  function openStatusModal(order) {
    AdminState.selectedOrderIdForStatus = order.id;
    updateStatusModal.classList.add("active");
  }

  // Initialize Admin App
  init();
});
