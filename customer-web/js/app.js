/**
 * HomeVibes Customer Web — Main Application Controller
 * Handles UI interactions, Cart, Catalog, Map Tracking, and Real-time State.
 * Currency: Indian Rupee (₹)
 * Strict Requirement: No emojis, professional product design system
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
    addresses: [],
    selectedAddressId: null,
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
  const closeCloudModalFooterBtn = document.getElementById("closeCloudModalFooterBtn");
  const cloudArchitectureModal = document.getElementById("cloudArchitectureModal");
  const tabArchOverview = document.getElementById("tabArchOverview");
  const tabArchConfig = document.getElementById("tabArchConfig");
  const archOverviewContent = document.getElementById("archOverviewContent");
  const archConfigContent = document.getElementById("archConfigContent");

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
  const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
  
  // Navbar Location
  const navLocationBtn = document.getElementById("navLocationBtn");
  const navAddressLabel = document.getElementById("navAddressLabel");
  const navAddressSnippet = document.getElementById("navAddressSnippet");

  // Checkout Address Card & Drawers
  const selectedAddressCard = document.getElementById("selectedAddressCard");
  const selectedAddressBadge = document.getElementById("selectedAddressBadge");
  const selectedAddressCoords = document.getElementById("selectedAddressCoords");
  const selectedAddressFull = document.getElementById("selectedAddressFull");
  const btnChangeAddress = document.getElementById("btnChangeAddress");

  const addressEmptyPrompt = document.getElementById("addressEmptyPrompt");
  const btnPromptGps = document.getElementById("btnPromptGps");
  const btnPromptManual = document.getElementById("btnPromptManual");

  const savedAddressesDrawer = document.getElementById("savedAddressesDrawer");
  const btnCloseSavedDrawer = document.getElementById("btnCloseSavedDrawer");
  const savedAddressesList = document.getElementById("savedAddressesList");
  const savedAddressCount = document.getElementById("savedAddressCount");
  const btnUseCurrentLocation = document.getElementById("btnUseCurrentLocation");
  const btnToggleManualAddress = document.getElementById("btnToggleManualAddress");

  const manualAddressDrawer = document.getElementById("manualAddressDrawer");
  const btnCloseManualDrawer = document.getElementById("btnCloseManualDrawer");
  const addressTagContainer = document.getElementById("addressTagContainer");
  const manualAddressFlat = document.getElementById("manualAddressFlat");
  const manualAddressBuilding = document.getElementById("manualAddressBuilding");
  const manualAddressStreet = document.getElementById("manualAddressStreet");
  const manualAddressCity = document.getElementById("manualAddressCity");
  const manualAddressPincode = document.getElementById("manualAddressPincode");
  const btnSaveManualAddress = document.getElementById("btnSaveManualAddress");
  const addressStatusNote = document.getElementById("addressStatusNote");

  // Dedicated Address Modal
  const addressModal = document.getElementById("addressModal");
  const closeAddressModalBtn = document.getElementById("closeAddressModalBtn");
  const btnModalUseGps = document.getElementById("btnModalUseGps");
  const modalSavedAddressList = document.getElementById("modalSavedAddressList");
  const btnModalToggleManual = document.getElementById("btnModalToggleManual");
  const modalManualDrawer = document.getElementById("modalManualDrawer");
  const modalAddressTagContainer = document.getElementById("modalAddressTagContainer");
  const modalAddressFlat = document.getElementById("modalAddressFlat");
  const modalAddressBuilding = document.getElementById("modalAddressBuilding");
  const modalAddressStreet = document.getElementById("modalAddressStreet");
  const modalAddressCity = document.getElementById("modalAddressCity");
  const modalAddressPincode = document.getElementById("modalAddressPincode");
  const btnModalSaveAddress = document.getElementById("btnModalSaveAddress");

  const checkoutPaymentMethod = document.getElementById("checkoutPaymentMethod");
  const checkoutNotes = document.getElementById("checkoutNotes");
  const checkoutItemsSummary = document.getElementById("checkoutItemsSummary");
  const checkoutGrandTotal = document.getElementById("checkoutGrandTotal");
  const submitOrderBtn = document.getElementById("submitOrderBtn");

  const recipeModal = document.getElementById("recipeModal");
  const closeRecipeModalBtn = document.getElementById("closeRecipeModalBtn");
  const recipeModalTitle = document.getElementById("recipeModalTitle");
  const recipeModalBody = document.getElementById("recipeModalBody");
  const recipeModalFooter = document.getElementById("recipeModalFooter");

  const trackingModal = document.getElementById("trackingModal");
  const closeTrackingBtn = document.getElementById("closeTrackingBtn");
  const closeTrackingFooterBtn = document.getElementById("closeTrackingFooterBtn");
  const trackingOrderSubtitle = document.getElementById("trackingOrderSubtitle");
  const trackingOrderNumber = document.getElementById("trackingOrderNumber");
  const trackingBatchBadge = document.getElementById("trackingBatchBadge");
  const trackingEtaBanner = document.getElementById("trackingEtaBanner");
  const trackingEtaTime = document.getElementById("trackingEtaTime");
  const trackingEtaDistance = document.getElementById("trackingEtaDistance");
  const trackingDriverDesc = document.getElementById("trackingDriverDesc");
  const trackingDriverName = document.getElementById("trackingDriverName");
  const trackingDriverAvatar = document.getElementById("trackingDriverAvatar");
  const trackingDriverCallBtn = document.getElementById("trackingDriverCallBtn");
  const trackingTimelineList = document.getElementById("trackingTimelineList");
  const trackingItemsSection = document.getElementById("trackingItemsSection");
  const trackingItemsList = document.getElementById("trackingItemsList");
  const simulateDriverMovementBtn = document.getElementById("simulateDriverMovementBtn");
  const openReviewBtn = document.getElementById("openReviewBtn");

  // Payment Gateway Portal Elements
  const paymentPortalModal = document.getElementById("paymentPortalModal");
  const paymentPortalAmount = document.getElementById("paymentPortalAmount");
  const payTabUpi = document.getElementById("payTabUpi");
  const payTabCard = document.getElementById("payTabCard");
  const payTabNetBanking = document.getElementById("payTabNetBanking");
  const payContentUpi = document.getElementById("payContentUpi");
  const payContentCard = document.getElementById("payContentCard");
  const payContentNetBanking = document.getElementById("payContentNetBanking");
  const upiQrCodeImg = document.getElementById("upiQrCodeImg");
  const upiTimer = document.getElementById("upiTimer");
  const btnGpayIntent = document.getElementById("btnGpayIntent");
  const btnPhonePeIntent = document.getElementById("btnPhonePeIntent");
  const btnPaytmIntent = document.getElementById("btnPaytmIntent");
  const btnBhimIntent = document.getElementById("btnBhimIntent");
  const upiVpaInput = document.getElementById("upiVpaInput");
  const btnVerifyUpi = document.getElementById("btnVerifyUpi");
  const btnSimulateUpiSuccess = document.getElementById("btnSimulateUpiSuccess");
  const cardDetailsView = document.getElementById("cardDetailsView");
  const cardOtpView = document.getElementById("cardOtpView");
  const cardNumberInput = document.getElementById("cardNumberInput");
  const cardHolderInput = document.getElementById("cardHolderInput");
  const cardExpiryInput = document.getElementById("cardExpiryInput");
  const cardCvvInput = document.getElementById("cardCvvInput");
  const btnSubmitCardPay = document.getElementById("btnSubmitCardPay");
  const cardOtpInput = document.getElementById("cardOtpInput");
  const btnVerifyCardOtp = document.getElementById("btnVerifyCardOtp");
  const btnCancelCardOtp = document.getElementById("btnCancelCardOtp");
  const btnSubmitNetBanking = document.getElementById("btnSubmitNetBanking");
  const btnClosePaymentPortal = document.getElementById("btnClosePaymentPortal");

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

  const cfgSupabaseUrl = document.getElementById("cfgSupabaseUrl");
  const cfgSupabaseKey = document.getElementById("cfgSupabaseKey");
  const saveCloudConfigBtn = document.getElementById("saveCloudConfigBtn");

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  async function init() {
    updateAuthUI();
    renderCart();
    loadSavedAddresses();

    if (cfgSupabaseUrl && cfgSupabaseKey && window.AppConfig) {
      cfgSupabaseUrl.value = window.AppConfig.getSupabaseUrl();
      cfgSupabaseKey.value = window.AppConfig.getSupabaseAnonKey();
    }

    try {
      AppState.categories = await window.dataService.getCategories();
      renderCategoryPills();
      await loadFoodItems();
    } catch (err) {
      console.error("Error initializing catalogue:", err);
      showToast("Unable to reach cloud catalogue. Loaded local cached recipes.", "warning");
    }

    setupEventListeners();
  }

  // ============================================================================
  // CATALOGUE & CATEGORIES
  // ============================================================================
  function renderCategoryPills() {
    categoryPillsContainer.innerHTML = `
      <div class="category-chip ${AppState.selectedCategoryId === 'ALL' ? 'active' : ''}" data-category-id="ALL">
        All Kits
      </div>
    `;

    AppState.categories.forEach(cat => {
      const chip = document.createElement("div");
      chip.className = `category-chip ${AppState.selectedCategoryId === cat.id ? 'active' : ''}`;
      chip.dataset.categoryId = cat.id;
      chip.textContent = cat.name;
      chip.addEventListener("click", () => {
        document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        AppState.selectedCategoryId = cat.id;
        loadFoodItems();
      });
      categoryPillsContainer.appendChild(chip);
    });

    categoryPillsContainer.firstElementChild.addEventListener("click", () => {
      document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
      categoryPillsContainer.firstElementChild.classList.add("active");
      AppState.selectedCategoryId = "ALL";
      loadFoodItems();
    });
  }

  async function loadFoodItems() {
    foodGridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        Loading meal kits catalogue...
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
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
          <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.5rem;">No meal kits found matching your search.</h3>
          <p style="font-size: 0.85rem;">Try selecting another category or clear your search query.</p>
        </div>
      `;
      itemCountLabel.textContent = "0 items";
      return;
    }

    itemCountLabel.textContent = `Showing ${AppState.foodItems.length} meal kits`;
    foodGridContainer.innerHTML = "";

    AppState.foodItems.forEach(item => {
      const isVeg = item.name.toLowerCase().includes("paneer") || 
                    item.name.toLowerCase().includes("dal") || 
                    item.name.toLowerCase().includes("chole") || 
                    item.name.toLowerCase().includes("naan") || 
                    item.name.toLowerCase().includes("jamun");

      const card = document.createElement("div");
      card.className = "food-card";
      card.innerHTML = `
        <div class="food-img-container">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'">
          <div class="card-badges">
            <span class="tag-badge ${isVeg ? 'veg' : ''}">${isVeg ? 'Vegetarian' : 'Non-Veg'}</span>
            ${item.spice_level ? `<span class="tag-badge spice">${item.spice_level} Spice</span>` : ''}
          </div>
        </div>
        <div class="food-card-body">
          <div class="food-meta-row">
            <span class="food-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${item.cook_time_minutes || 20} min cook
            </span>
            <span class="food-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${item.servings || 2} Servings
            </span>
          </div>
          <h3 class="food-title">${item.name}</h3>
          <p class="food-desc">${item.description}</p>
          <div class="food-footer">
            <div class="food-price-wrap">
              <span class="food-price-label">Kit Price</span>
              <span class="food-price">&#8377;${Number(item.price).toFixed(0)}</span>
            </div>
            <div class="card-actions">
              <button class="btn-recipe" data-recipe-id="${item.id}">View Recipe</button>
              <button class="btn-add" data-add-id="${item.id}">+ Add</button>
            </div>
          </div>
        </div>
      `;

      card.querySelector(".btn-recipe").addEventListener("click", () => {
        openRecipeModal(item);
      });

      card.querySelector(".btn-add").addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(item);
      });

      foodGridContainer.appendChild(card);
    });
  }

  // ============================================================================
  // RECIPE & COOKING SCRIPT MODAL
  // ============================================================================
  function openRecipeModal(item) {
    recipeModalTitle.textContent = item.name;

    const rawList = Array.isArray(item.raw_ingredients) ? item.raw_ingredients : [
      "Sealed protein / vegetable portion",
      "Signature slow-simmered gravy base",
      "Pre-measured whole spice pouch",
      "Cold-pressed oil or desi ghee"
    ];

    const scriptList = Array.isArray(item.cooking_script) ? item.cooking_script : [
      { step: 1, title: "Heat & Temper Spices", instruction: "Add oil or ghee to a heavy-bottomed pan on medium flame. Add whole spices and sauté for 30 seconds." },
      { step: 2, title: "Add Fresh Ingredients", instruction: "Add the pre-cut protein or vegetables. Sauté for 4-5 minutes until sealed." },
      { step: 3, title: "Simmer in Gravy Base", instruction: "Pour in the artisanal gravy base with 50ml water. Cover and simmer for 8 minutes." },
      { step: 4, title: "Rest & Garnish", instruction: "Turn off flame. Top with fresh herbs pouch and rest 2 minutes before serving hot." }
    ];

    const ingredientsHtml = rawList.map(ing => `
      <li class="ingredient-item">
        <span class="check-dot"></span>
        <span>${ing}</span>
      </li>
    `).join("");

    const scriptHtml = scriptList.map(stepObj => `
      <div class="script-step-card">
        <div class="script-step-num">${stepObj.step || 1}</div>
        <div class="script-step-content">
          <h4>${stepObj.title || 'Cooking Step'}</h4>
          <p>${stepObj.instruction || ''}</p>
        </div>
      </div>
    `).join("");

    recipeModalBody.innerHTML = `
      <div class="recipe-hero">
        <img src="${item.image_url}" alt="${item.name}">
      </div>

      <div class="recipe-meta-bar">
        <div>
          <div class="item-label">Cook Time</div>
          <div class="item-val">${item.cook_time_minutes || 20} Mins</div>
        </div>
        <div>
          <div class="item-label">Servings</div>
          <div class="item-val">${item.servings || 2} Persons</div>
        </div>
        <div>
          <div class="item-label">Spice Level</div>
          <div class="item-val">${item.spice_level || 'Medium'}</div>
        </div>
        <div>
          <div class="item-label">Kit Price</div>
          <div class="item-val">&#8377;${Number(item.price).toFixed(0)}</div>
        </div>
      </div>

      <div class="ingredients-box">
        <div class="ingredients-header">
          <span class="ingredients-title">Sealed Raw Materials Inside Kit</span>
          <span class="vendor-note">Direct Vendor Packaged</span>
        </div>
        <ul class="ingredient-list">
          ${ingredientsHtml}
        </ul>
      </div>

      <div class="script-section-title">Step-by-Step Chef Cooking Script</div>
      <div class="script-timeline">
        ${scriptHtml}
      </div>
    `;

    recipeModalFooter.innerHTML = `
      <button class="btn btn-secondary" id="modalDismissRecipeBtn">Close</button>
      <button class="btn btn-primary" id="modalAddRecipeCartBtn">
        Add Meal Kit to Cart — &#8377;${Number(item.price).toFixed(0)}
      </button>
    `;

    document.getElementById("modalDismissRecipeBtn").addEventListener("click", () => {
      recipeModal.classList.remove("open");
    });

    document.getElementById("modalAddRecipeCartBtn").addEventListener("click", () => {
      addToCart(item);
      recipeModal.classList.remove("open");
    });

    recipeModal.classList.add("open");
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
    showToast(`Added ${item.name} kit to cart`, "success");
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
          <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <div class="cart-empty-title">Your cart is empty</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Select from our authentic Indian meal kits to get started.</p>
        </div>
      `;
      cartSubtotal.innerHTML = "&#8377;0";
      cartTotal.innerHTML = "&#8377;0";
      proceedCheckoutBtn.disabled = true;
      return;
    }

    proceedCheckoutBtn.disabled = false;

    let subtotal = 0;
    cartItemsList.innerHTML = "";

    AppState.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <img class="cart-item-thumb" src="${item.image_url}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">&#8377;${item.price.toFixed(0)} &times; ${item.quantity} = &#8377;${itemTotal.toFixed(0)}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn btn-minus" data-id="${item.id}">&minus;</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
        </div>
      `;

      row.querySelector(".btn-minus").addEventListener("click", () => updateQuantity(item.id, -1));
      row.querySelector(".btn-plus").addEventListener("click", () => updateQuantity(item.id, 1));

      cartItemsList.appendChild(row);
    });

    const deliveryFee = 40;
    const grandTotal = subtotal + deliveryFee;

    cartSubtotal.innerHTML = `&#8377;${subtotal.toFixed(0)}`;
    cartDeliveryFee.innerHTML = `&#8377;${deliveryFee.toFixed(0)}`;
    cartTotal.innerHTML = `&#8377;${grandTotal.toFixed(0)}`;
  }

  // ============================================================================
  // ADDRESS MANAGEMENT & CHECKOUT FLOW (Dynamic GPS & Manual with Persistence)
  // ============================================================================
  function loadSavedAddresses() {
    let saved = [];
    try {
      const raw = localStorage.getItem("HOMEVIBES_SAVED_ADDRESSES");
      if (raw) {
        saved = JSON.parse(raw);
        // Filter out legacy hardcoded mock addresses (addr-blr-01, etc.)
        saved = saved.filter(a => a && a.id && !a.id.startsWith("addr-blr-0"));
      }
    } catch (e) {
      saved = [];
    }

    AppState.addresses = saved;
    if (!AppState.addresses || AppState.addresses.length === 0) {
      AppState.addresses = [
        {
          id: "addr-default-blr",
          label: "Home",
          address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
          latitude: 12.9279,
          longitude: 77.6710,
          isDefault: true
        }
      ];
      try {
        localStorage.setItem("HOMEVIBES_SAVED_ADDRESSES", JSON.stringify(AppState.addresses));
      } catch (_) {}
    }

    if (AppState.addresses.length > 0) {
      const exists = AppState.addresses.some(a => a.id === AppState.selectedAddressId);
      if (!exists) {
        AppState.selectedAddressId = AppState.addresses[0].id;
      }
    } else {
      AppState.selectedAddressId = null;
    }

    updateAddressUI();
  }

  function updateAddressUI() {
    const hasAddresses = AppState.addresses && AppState.addresses.length > 0;
    const current = hasAddresses ?
      (AppState.addresses.find(a => a.id === AppState.selectedAddressId) || AppState.addresses[0]) :
      null;

    if (current) {
      AppState.selectedAddressId = current.id;
    }

    // 1. Update Top Navbar Delivery Location Pill
    if (navAddressSnippet) {
      if (current) {
        const shortAddr = current.address.split(",")[0] || current.address;
        navAddressSnippet.textContent = `${current.label}: ${shortAddr}`;
        navAddressSnippet.title = current.address;
      } else {
        navAddressSnippet.textContent = "Select Location";
        navAddressSnippet.title = "Add your delivery location";
      }
    }

    // 2. Update Checkout Modal Address Section
    if (savedAddressCount) {
      savedAddressCount.textContent = hasAddresses ? `${AppState.addresses.length} saved` : "0 saved";
    }

    if (hasAddresses && current) {
      if (selectedAddressCard) selectedAddressCard.style.display = "block";
      if (addressEmptyPrompt) addressEmptyPrompt.style.display = "none";
      if (selectedAddressBadge) selectedAddressBadge.textContent = (current.label || "Home").toUpperCase();
      if (selectedAddressCoords) selectedAddressCoords.textContent = `${current.latitude.toFixed(4)}, ${current.longitude.toFixed(4)}`;
      if (selectedAddressFull) selectedAddressFull.textContent = current.address;
      if (addressStatusNote) {
        addressStatusNote.textContent = `Dispatch from Koramangala Hub • Destination: ${current.label} (${current.latitude.toFixed(4)}, ${current.longitude.toFixed(4)})`;
      }
    } else {
      if (selectedAddressCard) selectedAddressCard.style.display = "none";
      if (addressEmptyPrompt) addressEmptyPrompt.style.display = "block";
      if (addressStatusNote) {
        addressStatusNote.textContent = "Please add your delivery address (GPS or manual) to enable kit dispatch.";
      }
    }

    // 3. Render Saved Addresses inside Drawers
    renderSavedAddressList(savedAddressesList, "checkout");
    renderSavedAddressList(modalSavedAddressList, "modal");
  }

  function renderSavedAddressList(container, context) {
    if (!container) return;
    if (!AppState.addresses || AppState.addresses.length === 0) {
      container.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-secondary); font-size:0.82rem; background:var(--bg-surface-subtle); border-radius:var(--radius-sm);">
          No saved delivery addresses found. Use GPS detection or add an address manually below.
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.addresses.map(a => {
      const isSelected = a.id === AppState.selectedAddressId;
      return `
        <div class="saved-address-card-row ${isSelected ? 'selected' : ''}" data-id="${a.id}">
          <input type="radio" name="addrRadio_${context}" value="${a.id}" ${isSelected ? 'checked' : ''} style="margin-top:3px; cursor:pointer;">
          <div style="flex:1; cursor:pointer;" class="addr-select-trigger" data-id="${a.id}">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <span class="address-tag-badge" style="font-size:0.65rem;">${(a.label || "Home").toUpperCase()}</span>
              <span style="font-size:0.7rem; color:var(--text-tertiary); font-family:monospace;">${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}</span>
            </div>
            <div style="font-size:0.82rem; font-weight:600; color:var(--text-primary); line-height:1.3;">${a.address}</div>
          </div>
          <button type="button" class="btn-delete-addr" data-id="${a.id}" title="Remove this address" aria-label="Remove address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
    }).join("");

    // Bind item click and delete events in the rendered container
    container.querySelectorAll(".addr-select-trigger, input[type=radio]").forEach(el => {
      el.addEventListener("click", (e) => {
        const addrId = el.getAttribute("data-id") || el.value;
        if (addrId) {
          AppState.selectedAddressId = addrId;
          updateAddressUI();
          if (savedAddressesDrawer) savedAddressesDrawer.style.display = "none";
          if (addressModal) addressModal.classList.remove("open");
          const target = AppState.addresses.find(x => x.id === addrId);
          showToast(`Delivery location updated to: ${target?.label || 'Selected Address'}`, "info");
        }
      });
    });

    container.querySelectorAll(".btn-delete-addr").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const addrId = btn.getAttribute("data-id");
        if (addrId) {
          deleteAddress(addrId);
        }
      });
    });
  }

  async function detectGpsLocation(btnElement) {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "warning");
      return;
    }

    const originalContent = btnElement ? btnElement.innerHTML : "";
    if (btnElement) {
      btnElement.innerHTML = `<span>Detecting GPS Location...</span>`;
      btnElement.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        let addressText = `Live GPS Location (${lat}, ${lng})`;

        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (resp.ok) {
            const geoData = await resp.json();
            if (geoData && geoData.display_name) {
              const parts = geoData.display_name.split(", ");
              addressText = parts.slice(0, 4).join(", ");
            }
          }
        } catch (geoErr) {
          console.warn("Reverse geocode notice:", geoErr);
        }

        const newGpsAddr = {
          id: "addr-gps-" + Date.now(),
          label: "Live GPS",
          address: addressText,
          latitude: lat,
          longitude: lng,
          is_gps: true
        };

        AppState.addresses.unshift(newGpsAddr);
        AppState.selectedAddressId = newGpsAddr.id;
        localStorage.setItem("HOMEVIBES_SAVED_ADDRESSES", JSON.stringify(AppState.addresses));
        updateAddressUI();

        if (savedAddressesDrawer) savedAddressesDrawer.style.display = "none";
        if (addressModal) addressModal.classList.remove("open");

        if (btnElement) {
          btnElement.innerHTML = originalContent;
          btnElement.disabled = false;
        }

        showToast(`GPS Location saved and selected: ${addressText}`, "success");
      },
      (err) => {
        if (btnElement) {
          btnElement.innerHTML = originalContent;
          btnElement.disabled = false;
        }
        console.warn("GPS notice:", err);
        showToast("GPS access unavailable or permission denied. Please add address manually.", "info");
        if (manualAddressDrawer) manualAddressDrawer.style.display = "block";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function saveManualAddress({ label, flat, building, street, city, pincode, drawerElement }) {
    if (!street && !flat && !building) {
      showToast("Please enter your street or building address.", "warning");
      return;
    }

    const parts = [flat, building, street, city, pincode].filter(Boolean);
    const completeAddress = parts.join(", ");

    let lat = 12.9716;
    let lng = 77.5946;

    try {
      const query = [street, city, pincode].filter(Boolean).join(", ");
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (resp.ok) {
        const results = await resp.json();
        if (results && results.length > 0) {
          lat = Number(parseFloat(results[0].lat).toFixed(5));
          lng = Number(parseFloat(results[0].lon).toFixed(5));
        } else {
          lat = Number((12.9716 + (Math.random() - 0.5) * 0.05).toFixed(5));
          lng = Number((77.5946 + (Math.random() - 0.5) * 0.05).toFixed(5));
        }
      }
    } catch (e) {
      lat = Number((12.9716 + (Math.random() - 0.5) * 0.05).toFixed(5));
      lng = Number((77.5946 + (Math.random() - 0.5) * 0.05).toFixed(5));
    }

    const newAddr = {
      id: "addr-user-" + Date.now(),
      label: label || "Home",
      address: completeAddress,
      latitude: lat,
      longitude: lng,
      is_gps: false
    };

    AppState.addresses.unshift(newAddr);
    AppState.selectedAddressId = newAddr.id;
    localStorage.setItem("HOMEVIBES_SAVED_ADDRESSES", JSON.stringify(AppState.addresses));
    updateAddressUI();

    if (drawerElement) drawerElement.style.display = "none";
    if (savedAddressesDrawer) savedAddressesDrawer.style.display = "none";
    if (addressModal) addressModal.classList.remove("open");

    showToast(`Address "${label || 'Home'}" saved for future orders!`, "success");
  }

  function deleteAddress(id) {
    AppState.addresses = AppState.addresses.filter(a => a.id !== id);
    if (AppState.selectedAddressId === id) {
      AppState.selectedAddressId = AppState.addresses.length > 0 ? AppState.addresses[0].id : null;
    }
    localStorage.setItem("HOMEVIBES_SAVED_ADDRESSES", JSON.stringify(AppState.addresses));
    updateAddressUI();
    showToast("Address removed from saved list.", "info");
  }

  function openCheckout() {
    if (AppState.cart.length === 0) return;

    loadSavedAddresses();

    let subtotal = 0;
    let summaryHtml = "";

    AppState.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      summaryHtml += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>${item.quantity}&times; ${item.name}</span>
          <span style="font-weight: 600;">&#8377;${itemTotal.toFixed(0)}</span>
        </div>
      `;
    });

    const deliveryFee = 40;
    const total = subtotal + deliveryFee;

    summaryHtml += `
      <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 6px; margin-top: 6px; color: var(--text-secondary);">
        <span>Hub Delivery Fee</span>
        <span>&#8377;${deliveryFee.toFixed(0)}</span>
      </div>
    `;

    checkoutItemsSummary.innerHTML = summaryHtml;
    checkoutGrandTotal.innerHTML = `&#8377;${total.toFixed(0)}`;

    updateCheckoutSubmitButton();

    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("open");
    checkoutModal.classList.add("open");
  }

  function updateCheckoutSubmitButton() {
    if (!submitOrderBtn) return;
    const method = checkoutPaymentMethod ? checkoutPaymentMethod.value : "UPI";
    if (method === "COD") {
      submitOrderBtn.textContent = "Place Order (Cash on Delivery)";
    } else if (method === "Card") {
      submitOrderBtn.textContent = "Proceed to Card Payment";
    } else if (method === "NetBanking") {
      submitOrderBtn.textContent = "Proceed to Net Banking";
    } else {
      submitOrderBtn.textContent = "Proceed to UPI Payment";
    }
  }

  // ============================================================================
  // PAYMENT GATEWAY PORTAL (HomeVibes Pay)
  // ============================================================================
  let paymentTimerInterval = null;
  let pendingOrderPayload = null;

  function openPaymentPortal(total, method = "UPI") {
    if (!paymentPortalModal) return;
    if (paymentPortalAmount) paymentPortalAmount.innerHTML = `&#8377;${total.toFixed(0)}`;

    // Generate valid UPI URI
    const upiUri = `upi://pay?pa=homevibes@icici&pn=HomeVibes%20Kits&am=${total.toFixed(2)}&cu=INR&tn=HomeVibes%20Order`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(upiUri)}`;
    if (upiQrCodeImg) upiQrCodeImg.src = qrUrl;

    if (btnGpayIntent) btnGpayIntent.href = upiUri;
    if (btnPhonePeIntent) btnPhonePeIntent.href = upiUri;
    if (btnPaytmIntent) btnPaytmIntent.href = upiUri;
    if (btnBhimIntent) btnBhimIntent.href = upiUri;

    // Reset card views
    if (cardDetailsView) cardDetailsView.style.display = "block";
    if (cardOtpView) cardOtpView.style.display = "none";

    switchPayTab(method.toLowerCase());
    startPaymentTimer(180);

    paymentPortalModal.classList.add("open");
  }

  function switchPayTab(tabName) {
    const tabs = [
      { btnId: "payTabUpi", contentId: "payContentUpi", key: "upi" },
      { btnId: "payTabCard", contentId: "payContentCard", key: "card" },
      { btnId: "payTabNetBanking", contentId: "payContentNetBanking", key: "netbanking" }
    ];

    tabs.forEach(t => {
      const btn = document.getElementById(t.btnId);
      const content = document.getElementById(t.contentId);
      const isMatch = t.key === tabName || (tabName === "netbanking" && t.key === "netbanking");
      if (btn) {
        if (isMatch) btn.classList.add("active");
        else btn.classList.remove("active");
      }
      if (content) {
        content.style.display = isMatch ? "block" : "none";
      }
    });
  }

  function startPaymentTimer(durationSeconds) {
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
    let secondsLeft = durationSeconds;
    function updateDisplay() {
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      if (upiTimer) upiTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (secondsLeft <= 0) {
        clearInterval(paymentTimerInterval);
        showToast("Payment session timed out. Please retry.", "warning");
        closePaymentPortal();
      }
      secondsLeft--;
    }
    updateDisplay();
    paymentTimerInterval = setInterval(updateDisplay, 1000);
  }

  function closePaymentPortal() {
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
    if (paymentPortalModal) paymentPortalModal.classList.remove("open");
  }

  async function completeOnlinePayment(method, referenceId) {
    if (!pendingOrderPayload) {
      showToast("Order details missing. Please reorder.", "warning");
      return;
    }

    const payload = {
      ...pendingOrderPayload,
      paymentMethod: method,
      paymentStatus: "PAID",
      paymentId: referenceId || `TXN_${method}_${Date.now()}`
    };

    closePaymentPortal();
    await executeOrderCreation(payload);
  }

  async function handleOrderSubmission() {
    if (AppState.cart.length === 0) return;

    let selectedAddr = (AppState.addresses && AppState.addresses.length > 0)
      ? (AppState.addresses.find(a => a.id === AppState.selectedAddressId) || AppState.addresses[0])
      : null;

    if (!selectedAddr) {
      selectedAddr = {
        id: "addr-default-blr",
        label: "Home",
        address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
        latitude: 12.9279,
        longitude: 77.6710
      };
      AppState.addresses = [selectedAddr];
      AppState.selectedAddressId = selectedAddr.id;
      try {
        localStorage.setItem("HOMEVIBES_SAVED_ADDRESSES", JSON.stringify(AppState.addresses));
      } catch (_) {}
      updateAddressUI();
    }

    const subtotal = AppState.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;
    const selectedMethod = checkoutPaymentMethod ? checkoutPaymentMethod.value : "UPI";

    pendingOrderPayload = {
      items: [...AppState.cart],
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      totalAmount: total,
      deliveryAddress: selectedAddr.address,
      deliveryLat: selectedAddr.latitude,
      deliveryLng: selectedAddr.longitude,
      paymentMethod: selectedMethod,
      notes: checkoutNotes ? checkoutNotes.value : ""
    };

    checkoutModal.classList.remove("open");

    if (selectedMethod === "COD") {
      await executeOrderCreation({
        ...pendingOrderPayload,
        paymentStatus: "PENDING",
        paymentId: "COD-" + Date.now()
      });
    } else {
      openPaymentPortal(total, selectedMethod);
    }
  }

  async function executeOrderCreation(payload) {
    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = "Placing Order...";

    try {
      const createdOrder = await window.dataService.createOrder(payload);

      // Clear cart
      AppState.cart = [];
      saveCart();
      renderCart();

      showToast("Order placed successfully! Assigned to nearest delivery partner.", "success");
      openTrackingModal(createdOrder);
    } catch (err) {
      console.error("Order submission failed:", err);
      showToast("Order creation encountered an error: " + err.message, "danger");
    } finally {
      submitOrderBtn.disabled = false;
      submitOrderBtn.textContent = "Proceed to Payment";
    }
  }

  // ============================================================================
  // LIVE TELEMETRY & TRACKING DRAWER
  // ============================================================================
  async function openTrackingModal(order) {
    if (!order) {
      // Use demo order for demonstration
      order = {
        id: "ord-demo-" + Date.now(),
        order_number: "HV-" + Math.floor(100000 + Math.random() * 900000),
        status: "PREPARING",
        is_batch: false,
        delivery_address: AppState.addresses.length > 0 
          ? (AppState.addresses.find(a => a.id === AppState.selectedAddressId) || AppState.addresses[0]).address
          : "HomeVibes Demo — Koramangala 4th Block, Bengaluru",
        delivery_latitude: AppState.addresses.length > 0
          ? (AppState.addresses.find(a => a.id === AppState.selectedAddressId) || AppState.addresses[0]).latitude
          : 12.9352,
        delivery_longitude: AppState.addresses.length > 0
          ? (AppState.addresses.find(a => a.id === AppState.selectedAddressId) || AppState.addresses[0]).longitude
          : 77.6245,
        estimated_delivery_at: new Date(Date.now() + 25 * 60000).toISOString(),
        driver: { name: "Ravi Kumar", vehicle_type: "Electric Scooter", vehicle_number: "KA-01-HV-2026", phone: "+91-98765-43210" }
      };
    }
    AppState.activeOrder = order;

    // Header info
    if (trackingOrderNumber) {
      trackingOrderNumber.textContent = `Order #${order.order_number || (order.id ? order.id.slice(0, 8) : "--")}`;
    }
    if (trackingOrderSubtitle && !trackingOrderNumber) {
      trackingOrderSubtitle.textContent = `Order #${order.order_number || (order.id ? order.id.slice(0, 8) : "--")}`;
    }

    // Batch Badge
    if (trackingBatchBadge) {
      trackingBatchBadge.style.display = order.is_batch ? "inline-block" : "none";
    }

    // ETA Banner
    if (trackingEtaBanner) {
      if (order.status !== "DELIVERED" && order.status !== "CANCELLED") {
        trackingEtaBanner.style.display = "flex";
        let minsLeft = 25;
        if (order.estimated_delivery_at) {
          const diff = Math.round((new Date(order.estimated_delivery_at) - Date.now()) / 60000);
          if (diff > 0) minsLeft = diff;
        }
        if (trackingEtaTime) trackingEtaTime.textContent = `${minsLeft} mins`;
        if (trackingEtaDistance) trackingEtaDistance.textContent = `~2.8 km away`;
      } else {
        trackingEtaBanner.style.display = "none";
      }
    }

    // Stepper
    updateTrackingStepper(order.status);

    // Driver Profile Card
    const driver = order.driver || (order.drivers ? {
      name: (order.drivers.profiles && order.drivers.profiles.name) || order.drivers.name || "Ravi Kumar",
      phone: (order.drivers.profiles && order.drivers.profiles.phone) || order.drivers.phone || "+91-98765-43210",
      vehicle_type: order.drivers.vehicle_type || "Electric Scooter",
      vehicle_number: order.drivers.vehicle_number || "KA-01-HV-2026"
    } : null);

    if (driver) {
      if (trackingDriverName) trackingDriverName.textContent = driver.name;
      if (trackingDriverDesc) trackingDriverDesc.textContent = `${driver.vehicle_type || "Electric Fleet"} \u2022 ${driver.vehicle_number || "KA-01-HV"}`;
      if (trackingDriverAvatar) trackingDriverAvatar.textContent = (driver.name || "D").split(" ").map(n => n[0]).join("");
      if (trackingDriverCallBtn) {
        trackingDriverCallBtn.style.display = "inline-flex";
        trackingDriverCallBtn.href = `tel:${driver.phone || "+919876543210"}`;
      }
    } else {
      if (trackingDriverName) trackingDriverName.textContent = "Auto-assigning delivery partner...";
      if (trackingDriverDesc) trackingDriverDesc.textContent = "Scanning active delivery fleet within 15 km";
      if (trackingDriverAvatar) trackingDriverAvatar.textContent = "HV";
      if (trackingDriverCallBtn) trackingDriverCallBtn.style.display = "none";
    }

    // Items list in drawer
    if (trackingItemsList) {
      const items = order.order_items || order.items || [];
      if (items.length > 0) {
        trackingItemsList.innerHTML = items.map(item => {
          const title = item.food_items ? (item.food_items.name || item.food_items.title) : (item.name || item.title || "Meal Kit");
          const qty = item.quantity || 1;
          const price = item.price || item.unit_price || 0;
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm); font-size: 0.82rem;">
              <span style="font-weight: 600;">${title} &times; ${qty}</span>
              <span style="color: var(--text-secondary);">&#8377;${(price * qty).toFixed(0)}</span>
            </div>
          `;
        }).join("");
        if (trackingItemsSection) trackingItemsSection.style.display = "block";
      } else {
        if (trackingItemsSection) trackingItemsSection.style.display = "none";
      }
    }

    // Render Timeline Events
    await renderOrderTimelineEvents(order.id, order.status);

    trackingModal.classList.add("open");

    // Initialize or refresh map
    setTimeout(() => {
      initTrackingMap(order);
    }, 200);

    // Subscribe to realtime tracking updates
    subscribeToOrderRealtime(order.id);
  }

  async function renderOrderTimelineEvents(orderId, currentStatus) {
    if (!trackingTimelineList) return;
    trackingTimelineList.innerHTML = `<div style="font-size:0.8rem; color:var(--text-secondary); padding: 8px 0;">Loading timeline events...</div>`;

    try {
      const events = await window.dataService.getOrderTrackingEvents(orderId);
      if (!events || events.length === 0) {
        trackingTimelineList.innerHTML = `
          <div class="tracking-timeline-item">
            <div class="timeline-left">
              <div class="timeline-dot active"></div>
              <div class="timeline-line"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${(currentStatus || "PLACED").replace(/_/g, " ")}</div>
              <div class="timeline-desc">Order processing at HomeVibes Koramangala Hub</div>
              <div class="timeline-time">${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        `;
        return;
      }

      trackingTimelineList.innerHTML = events.map((evt, idx) => {
        const isLatest = idx === 0;
        const timeStr = new Date(evt.created_at || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        return `
          <div class="tracking-timeline-item">
            <div class="timeline-left">
              <div class="timeline-dot ${isLatest ? 'active' : 'done'}"></div>
              <div class="timeline-line"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">${(evt.status || "STATUS").replace(/_/g, " ")}</div>
              <div class="timeline-desc">${evt.message || "Status updated"}</div>
              <div class="timeline-time">${timeStr}</div>
            </div>
          </div>
        `;
      }).join("");
    } catch (err) {
      console.warn("Could not load tracking events:", err);
    }
  }

  function updateTrackingStepper(status) {
    const s = (status || "placed").toLowerCase();
    const steps = [
      { id: "stepPlaced", rank: 1 },
      { id: "stepConfirmed", rank: 2 },
      { id: "stepPreparing", rank: 3 },
      { id: "stepPickedUp", rank: 4 },
      { id: "stepOnWay", rank: 5 },
      { id: "stepDelivered", rank: 6 }
    ];

    const statusHierarchy = {
      "placed": 1,
      "confirmed": 2,
      "preparing": 3,
      "driver_assigned": 3,
      "ready_for_pickup": 3,
      "picked_up": 4,
      "out_for_delivery": 5,
      "delivered": 6
    };

    const currentRank = statusHierarchy[s] || 1;

    steps.forEach((step) => {
      const el = document.getElementById(step.id);
      if (!el) return;

      el.classList.remove("done", "active");

      if (step.rank < currentRank) {
        el.classList.add("done");
      } else if (step.rank === currentRank) {
        el.classList.add("active");
      }
    });

    if (s === "delivered" && openReviewBtn) {
      openReviewBtn.style.display = "inline-flex";
    }
  }

  function initTrackingMap(order) {
    const kitchenPos = [12.9352, 77.6245]; // Bengaluru Hub (Koramangala)
    const customerPos = [
      Number(order.delivery_latitude) || 12.9716, 
      Number(order.delivery_longitude) || 77.5946
    ];
    const midLat = (kitchenPos[0] + customerPos[0]) / 2;
    const midLng = (kitchenPos[1] + customerPos[1]) / 2;
    const driverPos = order.current_driver_location ? 
      [order.current_driver_location.lat, order.current_driver_location.lng] :
      [midLat, midLng];

    const mapElement = document.getElementById("liveTrackingMap");
    if (!mapElement) return;

    if (!AppState.map) {
      AppState.map = L.map('liveTrackingMap', {
        zoomControl: true,
        attributionControl: true
      }).setView(driverPos, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true
      }).addTo(AppState.map);

      const hubIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background:#1C1C1C; color:#FFF; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.3);">HUB</div>`,
        iconSize: [30, 30]
      });

      const customerIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background:#E85D3F; color:#FFF; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid #FFF; box-shadow:0 2px 6px rgba(0,0,0,0.3);">YOU</div>`,
        iconSize: [30, 30]
      });

      const driverIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background:#2563EB; color:#FFF; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid #FFF; box-shadow:0 2px 8px rgba(0,0,0,0.4);">GPS</div>`,
        iconSize: [34, 34]
      });

      AppState.markers.kitchen = L.marker(kitchenPos, { icon: hubIcon }).addTo(AppState.map).bindPopup("HomeVibes Raw Materials Hub (Koramangala)");
      AppState.markers.customer = L.marker(customerPos, { icon: customerIcon }).addTo(AppState.map).bindPopup(`Destination: ${order.delivery_address || 'Delivery Address'}`);
      AppState.markers.driver = L.marker(driverPos, { icon: driverIcon }).addTo(AppState.map).bindPopup("Delivery Fleet Agent");

      AppState.routeLine = L.polyline([kitchenPos, driverPos, customerPos], {
        color: '#E85D3F',
        weight: 3,
        dashArray: '6, 6'
      }).addTo(AppState.map);

      try {
        AppState.map.fitBounds([kitchenPos, driverPos, customerPos], { padding: [35, 35] });
      } catch (e) {}
    } else {
      AppState.map.invalidateSize();
      AppState.markers.customer.setLatLng(customerPos).setPopupContent(`Destination: ${order.delivery_address || 'Delivery Address'}`);
      AppState.markers.driver.setLatLng(driverPos);
      AppState.routeLine.setLatLngs([kitchenPos, driverPos, customerPos]);
      try {
        AppState.map.fitBounds([kitchenPos, driverPos, customerPos], { padding: [35, 35] });
      } catch (e) {}
    }
  }

  function subscribeToOrderRealtime(orderId) {
    if (AppState.unsubscribeRealtime) {
      AppState.unsubscribeRealtime();
    }

    if (window.dataService.subscribeToTrackingEvents) {
      AppState.unsubscribeRealtime = window.dataService.subscribeToTrackingEvents(
        orderId,
        (evt) => {
          if (evt.status) {
            updateTrackingStepper(evt.status);
          }
          renderOrderTimelineEvents(orderId, evt.status);
          showToast(`Delivery update: ${evt.message || evt.status}`, "info");
        }
      );
    } else {
      AppState.unsubscribeRealtime = window.dataService.subscribeToOrder(
        orderId,
        (updatedOrder) => {
          AppState.activeOrder = updatedOrder;
          updateTrackingStepper(updatedOrder.status);
          showToast(`Order status updated: ${updatedOrder.status}`, "info");
        }
      );
    }
  }

  // ============================================================================
  // MY ORDERS — PER-ORDER SEPARATE TRACKING CARDS
  // ============================================================================
  async function openOrdersHistory() {
    ordersHistoryList.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-secondary);">Loading your separate orders...</div>`;
    ordersModal.classList.add("open");

    let orders = [];
    const localOrders = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");

    try {
      const userId = window.dataService.getCurrentUser()?.id;
      if (userId && window.dataService.isCloud) {
        const cloudOrders = await window.dataService.getCustomerOrders(userId);
        const cloudIds = new Set((cloudOrders || []).map(o => o.id));
        const localOnly = localOrders.filter(o => !cloudIds.has(o.id));
        orders = [...(cloudOrders || []), ...localOnly];
      } else {
        orders = localOrders;
      }
    } catch (err) {
      console.warn("[Orders] Cloud fetch notice, using local fallback:", err.message);
      orders = localOrders;
    }

    if (!orders || orders.length === 0) {
      ordersHistoryList.innerHTML = `
        <div style="padding: 32px 16px; text-align: center; color: var(--text-secondary);">
          <div style="font-size:2rem; margin-bottom:8px; opacity:0.3;">&#9707;</div>
          <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">No past orders found</div>
          <p style="font-size: 0.85rem;">Each meal kit order you place will be tracked separately here with live GPS telemetry.</p>
        </div>
      `;
      return;
    }

    // Sort newest orders first
    orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    window.CURRENT_ORDERS_CACHE = orders;

    ordersHistoryList.innerHTML = orders.map(ord => {
      const items = ord.order_items || ord.items || [];
      const itemsPreview = items.length > 0
        ? items.map(i => {
            const title = i.food_items ? (i.food_items.name || i.food_items.title) : (i.name || i.title || "Meal Kit");
            return `${title} &times; ${i.quantity || 1}`;
          }).join(", ")
        : "Fresh Raw Ingredients Kit";

      const statusKey = (ord.status || "PLACED").toLowerCase();
      const statusPillClass = `status-badge ${statusKey}`;
      const dateStr = new Date(ord.created_at || Date.now()).toLocaleDateString("en-IN", {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const paymentMethodStr = ord.payment_method || "UPI";
      const paymentStatusStr = ord.payment_status || "PAID";

      return `
        <div class="order-history-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 800; font-size: 0.95rem;">Order #${ord.order_number || (ord.id || "").slice(0, 8)}</span>
                ${ord.is_batch ? `<span style="background: rgba(251,191,36,0.15); color: #B45309; border: 1px solid rgba(251,191,36,0.3); border-radius: 4px; padding: 1px 6px; font-size: 0.68rem; font-weight: 700;">BATCH DISPATCH</span>` : ""}
              </div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                Placed on ${dateStr}
              </div>
            </div>
            <span class="${statusPillClass}">${(ord.status || "PLACED").replace(/_/g, " ")}</span>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-secondary); background: var(--bg-surface-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 10px;">
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Items:</div>
            <div style="line-height: 1.4;">${itemsPreview}</div>
            ${ord.delivery_address ? `<div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">Delivering to: ${ord.delivery_address}</div>` : ""}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase;">Total Amount (${paymentMethodStr} &bull; ${paymentStatusStr})</div>
              <span style="font-weight: 800; font-size: 1.05rem;">&#8377;${Number(ord.total_amount || 0).toFixed(0)}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.trackExistingOrder('${ord.id}')" style="padding: 7px 16px;">
              Track Order
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  window.trackExistingOrder = async (orderId) => {
    if (ordersModal) ordersModal.classList.remove("open");

    // 1. Instant cache match
    let targetOrder = (window.CURRENT_ORDERS_CACHE || []).find(o => o.id === orderId);
    if (!targetOrder) {
      const localOrders = JSON.parse(localStorage.getItem("HOMEVIBES_MOCK_ORDERS") || "[]");
      targetOrder = localOrders.find(o => o.id === orderId || o.order_number === orderId);
    }

    if (targetOrder) {
      openTrackingModal(targetOrder);
      // Asynchronously fetch fresh telemetry in background
      try {
        const fresh = await window.dataService.getOrder(orderId);
        if (fresh) openTrackingModal(fresh);
      } catch (_) {}
      return;
    }

    // 2. Fetch from service with guaranteed fallback
    try {
      const order = await window.dataService.getOrder(orderId);
      openTrackingModal(order);
    } catch (err) {
      console.warn("Order tracking fallback:", err);
      openTrackingModal({
        id: orderId,
        order_number: "HV-" + (orderId || "").slice(0, 6).toUpperCase(),
        status: "PLACED",
        subtotal: 280,
        delivery_fee: 40,
        total_amount: 320,
        delivery_address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
        delivery_latitude: 12.9279,
        delivery_longitude: 77.6710,
        estimated_delivery_at: new Date(Date.now() + 25 * 60000).toISOString(),
        driver: { name: "Ravi Kumar", vehicle_type: "Electric Scooter", vehicle_number: "KA-01-HV-2026", phone: "+91-98765-43210" }
      });
    }
  };

  // ============================================================================
  // USER AUTHENTICATION
  // ============================================================================
  function updateAuthUI() {
    const user = window.authService.getCurrentUser();
    if (user) {
      const initials = (user.name || user.email).slice(0, 2).toUpperCase();
      authNavContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--text-primary); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">
            ${initials}
          </div>
          <button class="btn btn-secondary btn-sm" id="logoutBtn" title="Sign Out">Sign Out</button>
        </div>
      `;
      document.getElementById("logoutBtn").addEventListener("click", () => {
        window.authService.signOut();
        updateAuthUI();
        showToast("Signed out successfully", "info");
      });
    } else {
      authNavContainer.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="openAuthModalBtn">
          <span>Sign In</span>
        </button>
      `;
      document.getElementById("openAuthModalBtn").addEventListener("click", () => {
        authModal.classList.add("open");
      });
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Processing...";

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    try {
      if (isSignUpMode) {
        await window.authService.signUp(email, password, name);
        showToast("Account created successfully!", "success");
      } else {
        await window.authService.signIn(email, password);
        showToast("Signed in successfully!", "success");
      }
      authModal.classList.remove("open");
      updateAuthUI();
    } catch (err) {
      showToast(err.message || "Authentication error", "danger");
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isSignUpMode ? "Create Account" : "Sign In";
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // ============================================================================
  // EVENT LISTENERS BINDING
  // ============================================================================
  function setupEventListeners() {
    // Navigation
    if (navMenuBtn) navMenuBtn.addEventListener("click", () => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    });
    if (navOrdersBtn) navOrdersBtn.addEventListener("click", openOrdersHistory);
    if (navTrackingBtn) navTrackingBtn.addEventListener("click", () => openTrackingModal(null));

    // Cart Drawer
    openCartBtn.addEventListener("click", () => {
      cartDrawer.classList.add("open");
      cartBackdrop.classList.add("open");
    });
    closeCartBtn.addEventListener("click", () => {
      cartDrawer.classList.remove("open");
      cartBackdrop.classList.remove("open");
    });
    cartBackdrop.addEventListener("click", () => {
      cartDrawer.classList.remove("open");
      cartBackdrop.classList.remove("open");
    });

    // Checkout & Addresses
    proceedCheckoutBtn.addEventListener("click", openCheckout);
    closeCheckoutBtn.addEventListener("click", () => checkoutModal.classList.remove("open"));
    if (cancelCheckoutBtn) cancelCheckoutBtn.addEventListener("click", () => checkoutModal.classList.remove("open"));
    submitOrderBtn.addEventListener("click", handleOrderSubmission);
    if (checkoutPaymentMethod) {
      checkoutPaymentMethod.addEventListener("change", updateCheckoutSubmitButton);
    }

    // Navbar Delivery Location Pill
    if (navLocationBtn) {
      navLocationBtn.addEventListener("click", () => {
        if (addressModal) addressModal.classList.add("open");
      });
    }

    if (closeAddressModalBtn) {
      closeAddressModalBtn.addEventListener("click", () => {
        if (addressModal) addressModal.classList.remove("open");
      });
    }

    if (addressModal) {
      addressModal.addEventListener("click", (e) => {
        if (e.target === addressModal) addressModal.classList.remove("open");
      });
    }

    if (btnModalUseGps) {
      btnModalUseGps.addEventListener("click", () => detectGpsLocation(btnModalUseGps));
    }

    if (btnModalToggleManual) {
      btnModalToggleManual.addEventListener("click", () => {
        if (!modalManualDrawer) return;
        modalManualDrawer.style.display = modalManualDrawer.style.display === "none" ? "block" : "none";
      });
    }

    if (modalAddressTagContainer) {
      modalAddressTagContainer.querySelectorAll(".tag-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          modalAddressTagContainer.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
        });
      });
    }

    if (btnModalSaveAddress) {
      btnModalSaveAddress.addEventListener("click", () => {
        const activeTag = modalAddressTagContainer?.querySelector(".tag-pill.active")?.getAttribute("data-tag") || "Home";
        saveManualAddress({
          label: activeTag,
          flat: modalAddressFlat?.value?.trim() || "",
          building: modalAddressBuilding?.value?.trim() || "",
          street: modalAddressStreet?.value?.trim() || "",
          city: modalAddressCity?.value?.trim() || "Bengaluru",
          pincode: modalAddressPincode?.value?.trim() || "",
          drawerElement: modalManualDrawer
        });
      });
    }

    // Checkout Address Interactions
    if (btnChangeAddress) {
      btnChangeAddress.addEventListener("click", () => {
        if (!savedAddressesDrawer) return;
        savedAddressesDrawer.style.display = savedAddressesDrawer.style.display === "none" ? "block" : "none";
      });
    }

    if (btnCloseSavedDrawer) {
      btnCloseSavedDrawer.addEventListener("click", () => {
        if (savedAddressesDrawer) savedAddressesDrawer.style.display = "none";
      });
    }

    if (btnPromptGps) {
      btnPromptGps.addEventListener("click", () => detectGpsLocation(btnPromptGps));
    }

    if (btnPromptManual) {
      btnPromptManual.addEventListener("click", () => {
        if (manualAddressDrawer) manualAddressDrawer.style.display = "block";
      });
    }

    if (btnToggleManualAddress) {
      btnToggleManualAddress.addEventListener("click", () => {
        if (!manualAddressDrawer) return;
        manualAddressDrawer.style.display = manualAddressDrawer.style.display === "none" ? "block" : "none";
      });
    }

    if (btnCloseManualDrawer) {
      btnCloseManualDrawer.addEventListener("click", () => {
        if (manualAddressDrawer) manualAddressDrawer.style.display = "none";
      });
    }

    // Checkout manual tag pills
    if (addressTagContainer) {
      addressTagContainer.querySelectorAll(".tag-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          addressTagContainer.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
        });
      });
    }

    if (btnSaveManualAddress) {
      btnSaveManualAddress.addEventListener("click", () => {
        const activeTag = addressTagContainer?.querySelector(".tag-pill.active")?.getAttribute("data-tag") || "Home";
        saveManualAddress({
          label: activeTag,
          flat: manualAddressFlat?.value?.trim() || "",
          building: manualAddressBuilding?.value?.trim() || "",
          street: manualAddressStreet?.value?.trim() || "",
          city: manualAddressCity?.value?.trim() || "Bengaluru",
          pincode: manualAddressPincode?.value?.trim() || "",
          drawerElement: manualAddressDrawer
        });
      });
    }

    if (btnUseCurrentLocation) {
      btnUseCurrentLocation.addEventListener("click", () => detectGpsLocation(btnUseCurrentLocation));
    }

    // Recipe Modal Close
    closeRecipeModalBtn.addEventListener("click", () => recipeModal.classList.remove("open"));
    recipeModal.addEventListener("click", (e) => {
      if (e.target === recipeModal) recipeModal.classList.remove("open");
    });

    // Payment Portal Listeners
    if (payTabUpi) payTabUpi.addEventListener("click", () => switchPayTab("upi"));
    if (payTabCard) payTabCard.addEventListener("click", () => switchPayTab("card"));
    if (payTabNetBanking) payTabNetBanking.addEventListener("click", () => switchPayTab("netbanking"));

    if (btnSimulateUpiSuccess) {
      btnSimulateUpiSuccess.addEventListener("click", () => {
        completeOnlinePayment("UPI", `UPI_${Math.floor(10000000 + Math.random() * 90000000)}`);
      });
    }

    if (btnVerifyUpi) {
      btnVerifyUpi.addEventListener("click", () => {
        const vpa = upiVpaInput?.value?.trim();
        if (!vpa || !vpa.includes("@")) {
          showToast("Please enter a valid UPI ID (e.g. mobile@upi)", "warning");
          return;
        }
        btnVerifyUpi.disabled = true;
        btnVerifyUpi.textContent = "Requesting...";
        setTimeout(() => {
          btnVerifyUpi.disabled = false;
          btnVerifyUpi.textContent = "Request";
          completeOnlinePayment("UPI", `VPA_${vpa.split("@")[0].toUpperCase()}_${Date.now().toString().slice(-6)}`);
        }, 1200);
      });
    }

    if (btnSubmitCardPay) {
      btnSubmitCardPay.addEventListener("click", () => {
        const num = cardNumberInput?.value?.replace(/\s+/g, "") || "";
        if (num.length < 15) {
          showToast("Please enter a valid 16-digit card number", "warning");
          return;
        }
        if (cardDetailsView) cardDetailsView.style.display = "none";
        if (cardOtpView) cardOtpView.style.display = "block";
      });
    }

    if (btnCancelCardOtp) {
      btnCancelCardOtp.addEventListener("click", () => {
        if (cardOtpView) cardOtpView.style.display = "none";
        if (cardDetailsView) cardDetailsView.style.display = "block";
      });
    }

    if (btnVerifyCardOtp) {
      btnVerifyCardOtp.addEventListener("click", () => {
        const otp = cardOtpInput?.value?.trim();
        if (!otp || otp.length !== 6) {
          showToast("Please enter the 6-digit OTP sent to your phone", "warning");
          return;
        }
        btnVerifyCardOtp.disabled = true;
        btnVerifyCardOtp.textContent = "Verifying...";
        setTimeout(() => {
          btnVerifyCardOtp.disabled = false;
          btnVerifyCardOtp.textContent = "Verify & Complete Payment";
          completeOnlinePayment("CARD", `CARD_AUTH_${Math.floor(10000000 + Math.random() * 90000000)}`);
        }, 1000);
      });
    }

    if (btnSubmitNetBanking) {
      btnSubmitNetBanking.addEventListener("click", () => {
        btnSubmitNetBanking.disabled = true;
        btnSubmitNetBanking.textContent = "Redirecting to Bank Gateway...";
        setTimeout(() => {
          btnSubmitNetBanking.disabled = false;
          btnSubmitNetBanking.textContent = "Simulate Bank Authorization";
          completeOnlinePayment("NETBANKING", `NB_REF_${Math.floor(10000000 + Math.random() * 90000000)}`);
        }, 1200);
      });
    }

    if (btnClosePaymentPortal) {
      btnClosePaymentPortal.addEventListener("click", closePaymentPortal);
    }
    if (paymentPortalModal) {
      paymentPortalModal.addEventListener("click", (e) => {
        if (e.target === paymentPortalModal) closePaymentPortal();
      });
    }

    // Tracking Modal
    const handleCloseTracking = () => {
      if (AppState.unsubscribeRealtime) {
        AppState.unsubscribeRealtime();
        AppState.unsubscribeRealtime = null;
      }
      trackingModal.classList.remove("open");
    };
    closeTrackingBtn.addEventListener("click", handleCloseTracking);
    closeTrackingFooterBtn.addEventListener("click", handleCloseTracking);
    simulateDriverMovementBtn.addEventListener("click", () => {
      if (AppState.markers.driver) {
        const cur = AppState.markers.driver.getLatLng();
        const next = [cur.lat + 0.002, cur.lng - 0.002];
        AppState.markers.driver.setLatLng(next);
        if (AppState.map) AppState.map.panTo(next);
        showToast("Simulated GPS telemetry packet dispatched", "info");
      }
    });

    // Orders Modal
    closeOrdersBtn.addEventListener("click", () => ordersModal.classList.remove("open"));

    // Auth
    tabSignIn.addEventListener("click", () => {
      isSignUpMode = false;
      tabSignIn.style.color = "var(--text-primary)";
      tabSignIn.style.borderBottom = "2px solid var(--text-primary)";
      tabSignUp.style.color = "var(--text-secondary)";
      tabSignUp.style.borderBottom = "none";
      groupName.style.display = "none";
      authSubmitBtn.textContent = "Sign In";
    });

    tabSignUp.addEventListener("click", () => {
      isSignUpMode = true;
      tabSignUp.style.color = "var(--text-primary)";
      tabSignUp.style.borderBottom = "2px solid var(--text-primary)";
      tabSignIn.style.color = "var(--text-secondary)";
      tabSignIn.style.borderBottom = "none";
      groupName.style.display = "block";
      authSubmitBtn.textContent = "Create Account";
    });

    authForm.addEventListener("submit", handleAuthSubmit);
    closeAuthBtn.addEventListener("click", () => authModal.classList.remove("open"));

    // Search
    searchSubmitBtn.addEventListener("click", () => {
      AppState.searchQuery = foodSearchInput.value.trim();
      loadFoodItems();
    });
    foodSearchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        AppState.searchQuery = foodSearchInput.value.trim();
        loadFoodItems();
      }
    });

    // Cloud Viva Modal
    openCloudModalBtn.addEventListener("click", () => cloudArchitectureModal.classList.add("open"));
    closeCloudModalBtn.addEventListener("click", () => cloudArchitectureModal.classList.remove("open"));
    closeCloudModalFooterBtn.addEventListener("click", () => cloudArchitectureModal.classList.remove("open"));

    tabArchOverview.addEventListener("click", () => {
      tabArchOverview.style.fontWeight = "700";
      tabArchConfig.style.fontWeight = "400";
      archOverviewContent.style.display = "block";
      archConfigContent.style.display = "none";
    });

    tabArchConfig.addEventListener("click", () => {
      tabArchConfig.style.fontWeight = "700";
      tabArchOverview.style.fontWeight = "400";
      archOverviewContent.style.display = "none";
      archConfigContent.style.display = "block";
    });

    if (saveCloudConfigBtn) {
      saveCloudConfigBtn.addEventListener("click", () => {
        if (window.AppConfig) {
          window.AppConfig.setSupabaseConfig(cfgSupabaseUrl.value, cfgSupabaseKey.value);
          showToast("Cloud configuration saved and reconnected", "success");
        }
      });
    }
  }

  // Kickoff
  init();
});
