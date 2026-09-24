# HomeVibes — Cloud-Native System Architecture Specification

**Course:** Cloud Computing & Applications  
**System Name:** HomeVibes Cloud Food Delivery Ecosystem  
**Model:** Single Central Cloud Kitchen with Fleet Delivery Partners

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Client Layer
        CW["Customer Web Application<br/>(HTML5 / CSS3 / ES6+ / Leaflet)"]
        DA["Driver Mobile Application<br/>(Flutter Android / Dart / Geolocator)"]
        AW["Admin Operations Web<br/>(Dashboard / Dispatch Console)"]
    end

    subgraph Cloud Gateway & Security
        CF["Cloud CDN & Static Hosting<br/>(Vercel / Cloudflare)"]
        AUTH["Supabase Cloud Auth<br/>(JWT Tokens / Role Claims)"]
    end

    subgraph PaaS Backend (Supabase Cloud)
        DB[("PostgreSQL 15 Database<br/>RLS Policies & Triggers")]
        RT["Realtime Engine<br/>(WebSockets / Postgres WAL CDC)"]
        ST["Cloud Storage Buckets<br/>(Food / Avatars / Menus)"]
        EF["Serverless Edge Functions<br/>(Deno TypeScript Runtimes)"]
    end

    subgraph External Cloud Services
        FCM["Firebase Cloud Messaging<br/>(Push Notifications)"]
        GMAPS["Google Maps Platform<br/>(Tile & Routing Services)"]
    end

    CW -->|HTTPS / WSS| RT
    CW -->|REST / PostgREST| DB
    CW -->|Auth Requests| AUTH
    CW -->|Map Tiles| GMAPS

    DA -->|HTTPS / WSS| RT
    DA -->|GPS Coordinates| DB
    DA -->|Auth Requests| AUTH
    DA -->|Push Token Registration| FCM

    AW -->|HTTPS / WSS| RT
    AW -->|Orders & Drivers Query| DB
    AW -->|Auth Requests| AUTH

    EF -->|Verified SQL Transactions| DB
    EF -->|HTTP Dispatch| FCM
```

---

## 2. Architectural Principles

1. **Decoupled Three-Tier Topology:**
   - Client Tier: Autonomous Web and Mobile clients built with tailored user experiences.
   - Serverless Compute & Gateway Tier: Stateless Supabase Edge Functions with CORS protection.
   - Data & Communication Tier: Managed PostgreSQL database handling persistence, relational constraints, and WebSocket pub/sub.

2. **Database-Kernel Security (RLS):**
   - Security logic is not trusted to frontend clients. Even if an attacker modifies client JavaScript, PostgreSQL Row Level Security enforces that customers only access their own records, drivers access their deliveries, and only admins can modify restaurant menus.

3. **Event-Driven Asynchronous Processing:**
   - Order lifecycle changes trigger database functions that automatically populate the `notifications` log and stream update events to connected clients.
