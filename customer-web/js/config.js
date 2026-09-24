/**
 * HomeVibes Customer Web - Configuration Manager
 * Loads credentials from window.HOMEVIBES_ENV or localStorage fallback.
 */

const AppConfig = {
  // Default Central Kitchen Coordinates (Bengaluru Hub)
  DEFAULT_KITCHEN: {
    name: "HomeVibes Central Kitchen",
    lat: 12.9716,
    lng: 77.5946,
    address: "Brigade Road, Central Hub, Bengaluru, KA 560001"
  },

  getSupabaseUrl() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.SUPABASE_URL && !window.HOMEVIBES_ENV.SUPABASE_URL.includes("your-project-ref")) {
      return window.HOMEVIBES_ENV.SUPABASE_URL;
    }
    return localStorage.getItem("HOMEVIBES_SUPABASE_URL") || "";
  },

  getSupabaseAnonKey() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.SUPABASE_ANON_KEY && !window.HOMEVIBES_ENV.SUPABASE_ANON_KEY.includes("your-supabase-anon-key")) {
      return window.HOMEVIBES_ENV.SUPABASE_ANON_KEY;
    }
    return localStorage.getItem("HOMEVIBES_SUPABASE_ANON_KEY") || "";
  },

  getGoogleMapsApiKey() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY && !window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY.includes("your-google-maps")) {
      return window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY;
    }
    return localStorage.getItem("HOMEVIBES_GOOGLE_MAPS_KEY") || "";
  },

  getCentralKitchen() {
    return (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.CENTRAL_KITCHEN) || this.DEFAULT_KITCHEN;
  },

  isCloudConfigured() {
    const url = this.getSupabaseUrl();
    const key = this.getSupabaseAnonKey();
    return Boolean(url && key && url.startsWith("http"));
  },

  saveCredentials(url, anonKey, mapsKey) {
    if (url) localStorage.setItem("HOMEVIBES_SUPABASE_URL", url.trim());
    if (anonKey) localStorage.setItem("HOMEVIBES_SUPABASE_ANON_KEY", anonKey.trim());
    if (mapsKey) localStorage.setItem("HOMEVIBES_GOOGLE_MAPS_KEY", mapsKey.trim());
  },

  clearCredentials() {
    localStorage.removeItem("HOMEVIBES_SUPABASE_URL");
    localStorage.removeItem("HOMEVIBES_SUPABASE_ANON_KEY");
    localStorage.removeItem("HOMEVIBES_GOOGLE_MAPS_KEY");
  }
};

window.AppConfig = AppConfig;
