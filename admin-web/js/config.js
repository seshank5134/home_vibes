/**
 * HomeVibes Admin Web - Configuration Manager
 * Configured with live Supabase Project URL: https://aymdlyhwqtgmaizwqotw.supabase.co
 */

const AppConfig = {
  DEFAULT_SUPABASE_URL: "https://aymdlyhwqtgmaizwqotw.supabase.co",
  DEFAULT_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bWRseWh3cXRnbWFpendxb3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTk4ODUsImV4cCI6MjEwNTc5NTg4NX0.KlzI1laEI58eQispa8RmfbM5OJQY5bGm3i73K1hoyGs",
  DEFAULT_GOOGLE_MAPS_KEY: "AIzaSyB3bXCDoC6q__R_5k9DvNHBIBFu2jQQZ50",

  DEFAULT_KITCHEN: {
    name: "HomeVibes Central Hub (Bengaluru)",
    lat: 12.9716,
    lng: 77.5946,
    address: "Brigade Road, Central Hub, Bengaluru, KA 560001"
  },

  getSupabaseUrl() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.SUPABASE_URL && !window.HOMEVIBES_ENV.SUPABASE_URL.includes("your-project-ref")) {
      return window.HOMEVIBES_ENV.SUPABASE_URL;
    }
    return localStorage.getItem("HOMEVIBES_SUPABASE_URL") || this.DEFAULT_SUPABASE_URL;
  },

  getSupabaseAnonKey() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.SUPABASE_ANON_KEY && !window.HOMEVIBES_ENV.SUPABASE_ANON_KEY.includes("your-supabase-anon-key")) {
      return window.HOMEVIBES_ENV.SUPABASE_ANON_KEY;
    }
    return localStorage.getItem("HOMEVIBES_SUPABASE_ANON_KEY") || this.DEFAULT_SUPABASE_ANON_KEY;
  },

  getGoogleMapsApiKey() {
    if (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY && !window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY.includes("your-google-maps")) {
      return window.HOMEVIBES_ENV.GOOGLE_MAPS_API_KEY;
    }
    return localStorage.getItem("HOMEVIBES_GOOGLE_MAPS_KEY") || this.DEFAULT_GOOGLE_MAPS_KEY;
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
