/**
 * HomeVibes Driver Web - Configuration Manager
 * Live Supabase Project & Routing Configuration
 */

const AppConfig = {
  DEFAULT_SUPABASE_URL: "https://aymdlyhwqtgmaizwqotw.supabase.co",
  DEFAULT_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bWRseWh3cXRnbWFpendxb3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTk4ODUsImV4cCI6MjEwNTc5NTg4NX0.KlzI1laEI58eQispa8RmfbM5OJQY5bGm3i73K1hoyGs",
  DEFAULT_GOOGLE_MAPS_KEY: "AIzaSyB3bXCDoC6q__R_5k9DvNHBIBFu2jQQZ50",

  // Central Raw Materials Staging Hub (Bengaluru)
  DEFAULT_KITCHEN: {
    id: "hub-koramangala",
    name: "HomeVibes Central Staging Hub (Koramangala)",
    lat: 12.9352,
    lng: 77.6245,
    address: "Koramangala 4th Block, 80 Feet Road, Bengaluru, KA 560034"
  },

  // Default Demo Driver Profile
  DEMO_DRIVER: {
    id: "d2222222-bbbb-2222-bbbb-222222222222",
    name: "Ravi Kumar",
    phone: "+91 98765 43211",
    email: "driver@homevibes.com",
    vehicle_type: "Electric Scooter",
    vehicle_number: "KA-01-HV-2026",
    rating: 4.96,
    acceptance_rate: 97.5,
    lat: 12.9410,
    lng: 77.6180
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

  getCentralKitchen() {
    return (window.HOMEVIBES_ENV && window.HOMEVIBES_ENV.CENTRAL_KITCHEN) || this.DEFAULT_KITCHEN;
  },

  isCloudConfigured() {
    const url = this.getSupabaseUrl();
    const key = this.getSupabaseAnonKey();
    return Boolean(url && key && url.startsWith("http"));
  }
};

window.AppConfig = AppConfig;
