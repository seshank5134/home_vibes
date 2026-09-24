# HomeVibes — Cloud Deployment Architecture

**Target Deployment Model:** Multi-Cloud Hybrid (PaaS + CDN + Mobile Edge)

---

## 1. Cloud Infrastructure Topology

```mermaid
graph LR
    subgraph Edge / CDN Layer
        V1["Customer Web App<br/>(Vercel / Cloudflare Pages)"]
        V2["Admin Web App<br/>(Cloudflare Pages / S3+CloudFront)"]
        APK["Driver Android App<br/>(Google Play Store / APK Distribution)"]
    end

    subgraph Supabase PaaS Cloud (AWS / GCP Region)
        API["PostgREST Auto-API Gateway"]
        WS["Realtime WebSocket Cluster"]
        PG[("PostgreSQL 15 Managed Instance")]
        S3["Supabase Storage (S3-compatible)"]
        EDGE["Edge Functions Network (Deno)"]
    end

    subgraph 3rd-Party Cloud SaaS
        FIRE["Google Firebase (FCM)"]
        MAPS["Google Maps Platform API"]
    end

    V1 -->|HTTPS| API
    V1 -->|WSS| WS
    V2 -->|HTTPS| API
    APK -->|HTTPS / WSS| API
    APK -->|WSS| WS
    EDGE -->|Internal VPC SQL| PG
    API -->|Connection Pooler (PgBouncer)| PG
    EDGE -->|REST HTTP v1| FIRE
    V1 -->|API Call| MAPS
    APK -->|SDK Call| MAPS
```

---

## 2. Deployment Steps for Production

### Step A: Database & Backend (Supabase PaaS)
1. Create a Supabase project in an appropriate geographical region (e.g. `ap-south-1` for India).
2. Execute `supabase/migrations/001_initial_schema.sql` in the SQL Editor.
3. Execute `supabase/migrations/002_rls_policies.sql` to activate Row Level Security.
4. Execute `supabase/seed/seed.sql` to populate central kitchen menu items.
5. Deploy Edge Functions via Supabase CLI:
   ```bash
   npx supabase functions deploy create-order
   npx supabase functions deploy update-order-status
   npx supabase functions deploy assign-driver
   npx supabase functions deploy send-notification
   ```

### Step B: Customer Web & Admin Web (PaaS / Static CDN)
1. Update `customer-web/js/env.js` and `admin-web/js/env.js` with your production Supabase URL and Anon Key.
2. Deploy the `customer-web` folder to Vercel, Netlify, or AWS S3 + CloudFront:
   ```bash
   npx vercel customer-web --prod
   npx vercel admin-web --prod
   ```

### Step C: Driver Mobile Application (Flutter Android)
1. Update `driver-app/assets/config/env.json` with Supabase credentials.
2. Build Android release bundle:
   ```bash
   cd driver-app
   flutter build apk --release
   ```
3. Distribute the APK file to delivery fleet phones.
