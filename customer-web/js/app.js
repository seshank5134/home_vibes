/**
 * HomeVibes Customer Web — Main Application Controller
 * Handles UI interactions, Cart, Catalog, Map Tracking, and Real-time State.
 */

document.addEventListener("DOMContentLoaded", () => {
  const AppState = {
    cart: JSON.parse(localStorage.getItem("HOMEVIBES_CART") || "[]"),
    categories: [],
    foodItems: [],
    selectedCategoryId: "ALL",
    searchQuery: "",
    activeOrder: null,
    unsubscribeRealtime: null,
    map: null,
    markers: {
      kitchen: null,
      customer: null,
      driver: null
    },
    routeLine: null
  };

  // DOM Elements
  const brandHomeBtn = document.getElementById("brandHomeBtn");
  const navMenuBtn = document.getElementById("navMenuBtn");
  const navOrdersBtn = document.getElementById("navOrdersBtn");
  const navTrackingBtn = document.getElementById("navTrackingBtn");
  const openCloudModalBtn = document.getElementById("openCloudModalBtn");
  const closeCloudModalBtn = document.getElementById("closeCloudModalBtn");
  const cloudArchitectureModal = document.getElementById("cloudArchitectureModal");

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const cartBadge = document.getElementById("cartBadge");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartDeliveryFee = document.getElementById("cartDeliveryFee");
  const cartTotal = document.getElementById("cartTotal");
  const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");

  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  const checkoutAddressSelect = document.getElementById("checkoutAddressSelect");
  const checkoutPaymentMethod = document.getElementById("checkoutPaymentMethod");
  const checkoutNotes = document.getElementById("checkoutNotes");
  const checkoutItemsSummary = document.getElementById("checkoutItemsSummary");
  const checkoutGrandTotal = document.getElementById("checkoutGrandTotal");
  const submitOrderBtn = document.getElementById("submitOrderBtn");

  const trackingModal = document.getElementById("trackingModal");
  const closeTrackingBtn = document.getElementById("closeTrackingBtn");
  const trackingOrderSubtitle = document.getElementById("trackingOrderSubtitle");
  const trackingDriverDesc = document.getElementById("trackingDriverDesc");
  const simulateDriverMovementBtn = document.getElementById("simulateDriverMovementBtn");
  const openReviewBtn = document.getElementById("openReviewBtn");

  const ordersModal = document.getElementById("ordersModal");
  const closeOrdersBtn = document.getElementById("closeOrdersBtn");
  const ordersHistoryList = document.getElementById("ordersHistoryList");

  const authModal = document.getElementById("authModal");
  const openAuthModalBtn = document.getElementById("openAuthModalBtn");
  const closeAuthBtn = document.getElementById("closeAuthBtn");
  const authNavContainer = document.getElementById("authNavContainer");
  const authForm = document.getElementById("authForm");
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");
  const groupName = document.getElementById("groupName");
  const authName = document.getElementById("authName");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  let isSignUpMode = false;

  const categoryPillsContainer = document.getElementById("categoryPillsContainer");
  const foodGridContainer = document.getElementById("foodGridContainer");
  const itemCountLabel = document.getElementById("itemCountLabel");
  const foodSearchInput = document.getElementById("foodSearchInput");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  const toastContainer = document.getElementById("toastContainer");

  // Cloud Config inputs in modal
  const cfgSupabaseUrl = document.getElementById("cfgSupabaseUrl");
  const cfgSupabaseKey = document.getElementById("cfgSupabaseKey");
  const saveCloudConfigBtn = document.getElementById("saveCloudConfigBtn");

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  async function init() {
    updateAuthUI();
    renderCart();

    // Populate cloud config fields in modal
    if (cfgSupabaseUrl && cfgSupabaseKey && window.AppConfig) {
      cfgSupabaseUrl.value = window.AppConfig.getSupabaseUrl();
      cfgSupabaseKey.value = window.AppConfig.getSupabaseAnonKey();
    }

    try {
      // Load Categories & Food Items
      AppState.categories = await window.dataService.getCategories();
      renderCategoryPills();
      await loadFoodItems();
    } catch (err) {
      console.error("Error initializing catalogue:", err);
      showToast("Unable to load menu catalogue. Using fallback data.", "warning");
    }

    setupEventListeners();
  }

  // ============================================================================
  // CATALOGUE & CATEGORIES
  // ============================================================================
  function renderCategoryPills() {
    categoryPillsContainer.innerHTML = `
      <div class="category-chip ${AppState.selectedCategoryId === 'ALL' ? 'active' : ''}" data-category-id="ALL">
        <span>✨</span> All Delicacies
      </div>
    `;

    AppState.categories.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = `category-chip ${AppState.selectedCategoryId === cat.id ? 'active' : ''}`;
      chip.dataset.categoryId = cat.id;
      chip.innerHTML = `<span>🍽️</span> ${cat.name}`;
      chip.addEventListener("click", () => {
        document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        AppState.selectedCategoryId = cat.id;
        loadFoodItems();
      });
      categoryPillsContainer.appendChild(chip);
    });

    // Add click handler to ALL chip
    categoryPillsContainer.firstElementChild.addEventListener("click", () => {
      document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
      categoryPillsContainer.firstElementChild.classList.add("active");
      AppState.selectedCategoryId = "ALL";
      loadFoodItems();
    });
  }

  async function loadFoodItems() {
    foodGridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <div class="pulse-dot" style="margin: 0 auto 1rem; width: 14px; height: 14px;"></div>
        Loading gourmet menu items...
      </div>
    `;

    try {
      AppState.foodItems = await window.dataService.getFoodItems(
        AppState.selectedCategoryId,
        AppState.searchQuery
      );
      renderFoodGrid();
    } catch (err) {
      console.error("Error loading food items:", err);
      AppState.foodItems = window.HOMEVIBES_MOCK_DATA.foodItems;
      renderFoodGrid();
    }
  }

  function renderFoodGrid() {
    if (!AppState.foodItems || AppState.foodItems.length === 0) {
      foodGridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>No delicacies found matching your search.</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">Try selecting another category or clear your search query.</p>
        </div>
      `;
      itemCountLabel.textContent = "0 items";
      return;
    }

    itemCountLabel.textContent = `Showing ${AppState.foodItems.length} items`;
    foodGridContainer.innerHTML = "";

    AppState.foodItems.forEach(item => {
      const card = document.createElement("div");
      card.className = "food-card";
      card.innerHTML = `
        <div class="food-img-container">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'">
          ${item.is_featured ? `<span class="card-badge">★ Chef's Choice</span>` : ''}
          <span class="prep-badge">⏱️ ${item.prep_time_minutes || 20}m</span>
        </div>
        <div class="food-card-body">
          <h3 class="food-title">${item.name}</h3>
          <p class="food-desc">${item.description}</p>
          <div class="food-footer">
            <div class="food-price">$${Number(item.price).toFixed(2)}</div>
            <button class="add-cart-btn" data-food-id="${item.id}">
              <span>+ Add</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector(".add-cart-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(item);
      });

      foodGridContainer.appendChild(card);
    });
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================
  function addToCart(item) {
    const existing = AppState.cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      AppState.cart.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        quantity: 1
      });
    }
    saveCart();
    renderCart();
    showToast(`Added ${item.name} to cart!`, "success");

    // Animate cart badge
    cartBadge.style.transform = "scale(1.35)";
    setTimeout(() => { cartBadge.style.transform = "scale(1)"; }, 250);
  }

  function updateQuantity(foodId, delta) {
    const item = AppState.cart.find(c => c.id === foodId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      AppState.cart = AppState.cart.filter(c => c.id !== foodId);
    }
    saveCart();
    renderCart();
  }

  function saveCart() {
    localStorage.setItem("HOMEVIBES_CART", JSON.stringify(AppState.cart));
  }

  function renderCart() {
    const totalQty = AppState.cart.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = totalQty;

    if (AppState.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">Your cart is empty</div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Explore our gourmet kitchen items and add your favorites!</p>
        </div>
      `;
      cartSubtotal.textContent = "$0.00";
      cartTotal.textContent = "$0.00";
      proceedCheckoutBtn.disabled = true;
      proceedCheckoutBtn.style.opacity = "0.5";
      return;
    }

    proceedCheckoutBtn.disabled = false;
    proceedCheckoutBtn.style.opacity = "1";

    let subtotal = 0;
    cartItemsList.innerHTML = "";

    AppState.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <img class="cart-item-thumb" src="${item.image_url}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity} = $${itemTotal.toFixed(2)}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn btn-minus" data-id="${item.id}">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
        </div>
      `;

      row.querySelector(".btn-minus").addEventListener("click", () => updateQuantity(item.id, -1));
      row.querySelector(".btn-plus").addEventListener("click", () => updateQuantity(item.id, 1));

      cartItemsList.appendChild(row);
    });

    const deliveryFee = subtotal > 35 ? 0.00 : 2.50;
    const grandTotal = subtotal + deliveryFee;

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartDeliveryFee.textContent = deliveryFee === 0 ? "FREE (Orders > $35)" : `$${deliveryFee.toFixed(2)}`;
    cartTotal.textContent = `$${grandTotal.toFixed(2)}`;
  }

  function openCartDrawer() {
    cartDrawer.classList.add("active");
    cartBackdrop.classList.add("active");
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove("active");
    cartBackdrop.classList.remove("active");
  }

  // ============================================================================
  // CHECKOUT
  // ============================================================================
  async function openCheckoutModal() {
    closeCartDrawer();
    const user = window.dataService.getCurrentUser();
    const addresses = await window.dataService.getAddresses(user ? user.id : null);

    checkoutAddressSelect.innerHTML = addresses.map(a => `
      <option value="${a.address}" data-lat="${a.latitude}" data-lng="${a.longitude}">
        ${a.label}: ${a.address}
      </option>
    `).join("");

    let subtotal = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = subtotal > 35 ? 0.00 : 2.50;
    const grandTotal = subtotal + deliveryFee;

    checkoutItemsSummary.innerHTML = AppState.cart.map(i => `${i.name} (x${i.quantity})`).join(", ");
    checkoutGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;

    checkoutModal.classList.add("active");
  }

  async function handleOrderSubmission() {
    if (AppState.cart.length === 0) return;

    const selectedOption = checkoutAddressSelect.options[checkoutAddressSelect.selectedIndex];
    const deliveryAddress = selectedOption ? selectedOption.value : "100 Feet Road, Indiranagar, Bengaluru";
    const deliveryLat = selectedOption ? Number(selectedOption.dataset.lat) : 12.9784;
    const deliveryLng = selectedOption ? Number(selectedOption.dataset.lng) : 77.6408;

    let subtotal = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = subtotal > 35 ? 0.00 : 2.50;
    const grandTotal = subtotal + deliveryFee;

    submitOrderBtn.disabled = true;
    submitOrderBtn.innerHTML = `<span>⏳ Dispatching Order to Cloud...</span>`;

    try {
      const order = await window.dataService.createOrder({
        items: AppState.cart,
        subtotal,
        deliveryFee,
        totalAmount: grandTotal,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        paymentMethod: checkoutPaymentMethod.value,
        notes: checkoutNotes.value
      });

      // Clear cart
      AppState.cart = [];
      saveCart();
      renderCart();

      checkoutModal.classList.remove("active");
      showToast(`Order ${order.order_number} successfully created!`, "success");

      // Open tracking modal
      openTrackingModal(order.id);
    } catch (err) {
      console.error("Order creation failed:", err);
      showToast(`Unable to place order: ${err.message || err}`, "warning");
    } finally {
      submitOrderBtn.disabled = false;
      submitOrderBtn.innerHTML = `🚀 Place Cloud Order`;
    }
  }

  // ============================================================================
  // ORDER TRACKING & REALTIME GPS MAP
  // ============================================================================
  async function openTrackingModal(orderId = null) {
    let order;
    if (orderId) {
      order = await window.dataService.getOrder(orderId);
    } else {
      // Find latest placed order
      const orders = await window.dataService.getCustomerOrders();
      order = orders.length > 0 ? orders[0] : await window.dataService.getOrder("HV-847291");
    }

    if (!order) {
      showToast("No active order found to track.", "info");
      return;
    }

    AppState.activeOrder = order;
    trackingOrderSubtitle.textContent = `Order #${order.order_number || order.id} • ${order.payment_method}`;

    updateTrackingStepper(order.status);
    initOrUpdateMap(order);

    trackingModal.classList.add("active");

    // Clean previous realtime listener
    if (AppState.unsubscribeRealtime) {
      AppState.unsubscribeRealtime();
    }

    // Subscribe to live status changes
    AppState.unsubscribeRealtime = window.dataService.subscribeToOrder(order.id, (updated) => {
      showToast(`⚡ Order status updated: ${updated.status}`, "info");
      updateTrackingStepper(updated.status);
      if (updated.status === "DELIVERED") {
        openReviewBtn.style.display = "inline-flex";
      }
    });
  }

  function updateTrackingStepper(status) {
    const sequence = [
      "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "DRIVER_ASSIGNED",
      "PICKED_UP",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];

    const currentIndex = sequence.indexOf(status);

    sequence.forEach((s, idx) => {
      const stepEl = document.getElementById(`step-${s}`);
      if (!stepEl) return;

      stepEl.classList.remove("completed", "active");

      if (idx < currentIndex) {
        stepEl.classList.add("completed");
        const marker = stepEl.querySelector(".step-marker");
        if (marker) marker.textContent = "✓";
      } else if (idx === currentIndex) {
        stepEl.classList.add("active");
        const marker = stepEl.querySelector(".step-marker");
        if (marker && s === "OUT_FOR_DELIVERY") marker.textContent = "🛵";
      }
    });

    if (status === "DELIVERED") {
      openReviewBtn.style.display = "inline-flex";
    }
  }

  function initOrUpdateMap(order) {
    const kitchen = window.AppConfig.getCentralKitchen();
    const custLat = order.delivery_latitude || 12.9784;
    const custLng = order.delivery_longitude || 77.6408;

    // Wait until modal is rendered for correct sizing
    setTimeout(() => {
      if (!AppState.map) {
        AppState.map = L.map("trackingMap").setView([kitchen.lat, kitchen.lng], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(AppState.map);
      }

      AppState.map.invalidateSize();

      // Clear existing markers
      if (AppState.markers.kitchen) AppState.map.removeLayer(AppState.markers.kitchen);
      if (AppState.markers.customer) AppState.map.removeLayer(AppState.markers.customer);
      if (AppState.markers.driver) AppState.map.removeLayer(AppState.markers.driver);
      if (AppState.routeLine) AppState.map.removeLayer(AppState.routeLine);

      // Kitchen Marker
      const kitchenIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">🍳</div>`,
        iconSize: [30, 30]
      });
      AppState.markers.kitchen = L.marker([kitchen.lat, kitchen.lng], { icon: kitchenIcon })
        .addTo(AppState.map)
        .bindPopup(`<b>${kitchen.name}</b><br>Dispatch Center`);

      // Customer Marker
      const custIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">🏠</div>`,
        iconSize: [30, 30]
      });
      AppState.markers.customer = L.marker([custLat, custLng], { icon: custIcon })
        .addTo(AppState.map)
        .bindPopup(`<b>Destination</b><br>${order.delivery_address || 'Delivery Address'}`);

      // Driver Marker (Starts near kitchen or current driver pos)
      const driverLat = order.drivers?.current_latitude || kitchen.lat + 0.003;
      const driverLng = order.drivers?.current_longitude || kitchen.lng + 0.004;

      const driverIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="font-size: 28px; filter: drop-shadow(0 3px 8px rgba(255,94,54,0.7)); transform: scale(1.1);">🛵</div>`,
        iconSize: [32, 32]
      });
      AppState.markers.driver = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(AppState.map)
        .bindPopup(`<b>Driver</b><br>${order.drivers?.profiles?.name || 'Ravi Kumar (Speedy Driver)'}`);

      // Route Polyline
      AppState.routeLine = L.polyline(
        [[kitchen.lat, kitchen.lng], [driverLat, driverLng], [custLat, custLng]],
        { color: '#ff5e36', weight: 4, dashArray: '8, 8', opacity: 0.85 }
      ).addTo(AppState.map);

      // Fit bounds
      AppState.map.fitBounds([
        [kitchen.lat, kitchen.lng],
        [custLat, custLng]
      ], { padding: [40, 40] });

    }, 200);
  }

  function simulateDriverMovement() {
    if (!AppState.activeOrder) return;
    showToast("📍 Starting real-time GPS breadcrumb simulation...", "info");

    window.dataService.simulateLocalDriverGPS(AppState.activeOrder.id, (coord) => {
      if (AppState.markers.driver && AppState.map) {
        AppState.markers.driver.setLatLng([coord.latitude, coord.longitude]);
        AppState.map.panTo([coord.latitude, coord.longitude]);
      }
    });
  }

  // ============================================================================
  // ORDERS HISTORY
  // ============================================================================
  async function openOrdersHistoryModal() {
    const user = window.dataService.getCurrentUser();
    const orders = await window.dataService.getCustomerOrders(user ? user.id : null);

    ordersHistoryList.innerHTML = "";

    if (!orders || orders.length === 0) {
      ordersHistoryList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
          <p>No past orders placed yet.</p>
        </div>
      `;
    } else {
      orders.forEach(o => {
        const item = document.createElement("div");
        item.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;";
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.2rem;">Order #${o.order_number}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">${new Date(o.created_at).toLocaleString()}</div>
            <div style="display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: rgba(255,94,54,0.15); color: #ff7552;">
              ${o.status}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">
              $${Number(o.total_amount).toFixed(2)}
            </div>
            <button class="btn-primary track-btn" data-order-id="${o.id}" style="font-size: 0.85rem; padding: 0.4rem 1rem;">
              Track Order
            </button>
          </div>
        `;

        item.querySelector(".track-btn").addEventListener("click", () => {
          ordersModal.classList.remove("active");
          openTrackingModal(o.id);
        });

        ordersHistoryList.appendChild(item);
      });
    }

    ordersModal.classList.add("active");
  }

  // ============================================================================
  // AUTHENTICATION UI & LOGIC
  // ============================================================================
  function updateAuthUI() {
    const user = window.dataService.getCurrentUser();
    if (user) {
      authNavContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 0.9rem; font-weight: 600; color: #fff;">
            👤 ${user.name || 'Customer'}
          </div>
          <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.8rem;" id="logoutBtn">
            Sign Out
          </button>
        </div>
      `;
      document.getElementById("logoutBtn").addEventListener("click", async () => {
        await window.dataService.logout();
        updateAuthUI();
        showToast("Signed out successfully.", "info");
      });
    } else {
      authNavContainer.innerHTML = `
        <button class="btn-primary" id="openAuthModalBtn">
          <span>Sign In</span>
        </button>
      `;
      document.getElementById("openAuthModalBtn").addEventListener("click", () => {
        authModal.classList.add("active");
      });
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Processing...";

    try {
      if (isSignUpMode) {
        await window.dataService.register({ email, password, name });
        showToast("Registration successful! Welcome to HomeVibes.", "success");
      } else {
        await window.dataService.login({ email, password });
        showToast("Signed in successfully!", "success");
      }
      authModal.classList.remove("active");
      updateAuthUI();
    } catch (err) {
      console.error("Auth error:", err);
      showToast(err.message || "Authentication failed", "warning");
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isSignUpMode ? "Create Account" : "Sign In";
    }
  }

  // ============================================================================
  // EVENT LISTENERS & NAVIGATION
  // ============================================================================
  function setupEventListeners() {
    // Navigation
    brandHomeBtn.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    navMenuBtn.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("menu").scrollIntoView({ behavior: 'smooth' }); });
    navOrdersBtn.addEventListener("click", (e) => { e.preventDefault(); openOrdersHistoryModal(); });
    navTrackingBtn.addEventListener("click", (e) => { e.preventDefault(); openTrackingModal(); });

    // Modals
    openCloudModalBtn.addEventListener("click", () => cloudArchitectureModal.classList.add("active"));
    closeCloudModalBtn.addEventListener("click", () => cloudArchitectureModal.classList.remove("active"));
    cloudArchitectureModal.addEventListener("click", (e) => { if (e.target === cloudArchitectureModal) cloudArchitectureModal.classList.remove("active"); });

    openCartBtn.addEventListener("click", openCartDrawer);
    closeCartBtn.addEventListener("click", closeCartDrawer);
    cartBackdrop.addEventListener("click", closeCartDrawer);
    proceedCheckoutBtn.addEventListener("click", openCheckoutModal);

    closeCheckoutBtn.addEventListener("click", () => checkoutModal.classList.remove("active"));
    checkoutModal.addEventListener("click", (e) => { if (e.target === checkoutModal) checkoutModal.classList.remove("active"); });
    submitOrderBtn.addEventListener("click", handleOrderSubmission);

    closeTrackingBtn.addEventListener("click", () => trackingModal.classList.remove("active"));
    trackingModal.addEventListener("click", (e) => { if (e.target === trackingModal) trackingModal.classList.remove("active"); });
    simulateDriverMovementBtn.addEventListener("click", simulateDriverMovement);
    openReviewBtn.addEventListener("click", () => {
      const rating = prompt("Rate your delivery experience (1-5 stars):", "5");
      const comment = prompt("Optional feedback comments:", "Delicious food and lightning-fast delivery!");
      if (rating) {
        window.dataService.submitReview({
          orderId: AppState.activeOrder.id,
          rating,
          comment
        });
        showToast("Thank you for your rating! ⭐", "success");
      }
    });

    closeOrdersBtn.addEventListener("click", () => ordersModal.classList.remove("active"));
    ordersModal.addEventListener("click", (e) => { if (e.target === ordersModal) ordersModal.classList.remove("active"); });

    // Auth Modal
    closeAuthBtn.addEventListener("click", () => authModal.classList.remove("active"));
    authModal.addEventListener("click", (e) => { if (e.target === authModal) authModal.classList.remove("active"); });
    tabSignIn.addEventListener("click", () => {
      isSignUpMode = false;
      groupName.style.display = "none";
      tabSignIn.style.background = "var(--card-hover)";
      tabSignIn.style.color = "#fff";
      tabSignUp.style.background = "none";
      tabSignUp.style.color = "var(--text-muted)";
      authSubmitBtn.textContent = "Sign In";
    });
    tabSignUp.addEventListener("click", () => {
      isSignUpMode = true;
      groupName.style.display = "block";
      tabSignUp.style.background = "var(--card-hover)";
      tabSignUp.style.color = "#fff";
      tabSignIn.style.background = "none";
      tabSignIn.style.color = "var(--text-muted)";
      authSubmitBtn.textContent = "Create Account";
    });
    authForm.addEventListener("submit", handleAuthSubmit);

    // Autofill demo accounts
    document.getElementById("autofillCustomer").addEventListener("click", () => {
      authEmail.value = "customer@homevibes.com";
      authPassword.value = "HomeVibes@2026";
    });
    document.getElementById("autofillDriver").addEventListener("click", () => {
      authEmail.value = "driver@homevibes.com";
      authPassword.value = "HomeVibes@2026";
    });
    document.getElementById("autofillAdmin").addEventListener("click", () => {
      authEmail.value = "admin@homevibes.com";
      authPassword.value = "HomeVibes@2026";
    });

    // Search bar
    foodSearchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      loadFoodItems();
    });
    searchSubmitBtn.addEventListener("click", () => {
      AppState.searchQuery = foodSearchInput.value;
      loadFoodItems();
    });

    // Cloud credentials save
    if (saveCloudConfigBtn) {
      saveCloudConfigBtn.addEventListener("click", () => {
        const url = cfgSupabaseUrl.value.trim();
        const key = cfgSupabaseKey.value.trim();
        window.AppConfig.saveCredentials(url, key);
        window.dataService.init();
        showToast("Supabase cloud credentials saved! Reconnected.", "success");
        cloudArchitectureModal.classList.remove("active");
        loadFoodItems();
      });
    }
  }

  // Toast Notification Helper
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Start app
  init();
});
