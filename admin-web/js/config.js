/**
 * HomeVibes Admin Web - Configuration Manager
 */

const AppConfig = {
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

  isCloudConfigured() {
    const url = this.getSupabaseUrl();
    const key = this.getSupabaseAnonKey();
    return Boolean(url && key && url.startsWith("http"));
  },

  saveCredentials(url, anonKey) {
    if (url) localStorage.setItem("HOMEVIBES_SUPABASE_URL", url.trim());
    if (anonKey) localStorage.setItem("HOMEVIBES_SUPABASE_ANON_KEY", anonKey.trim());
  }
};

window.AppConfig = AppConfig;
