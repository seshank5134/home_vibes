# HomeVibes — Master Implementation Plan

> **For Claude / Antigravity:** REQUIRED SUB-SKILL: Follow phased execution with verification at each phase.

**Goal:** Build a completely new, production-grade cloud-native food delivery platform named **HomeVibes** from scratch, featuring a Customer Web App, a Flutter Driver Android App, an Admin Web Dashboard, and a Supabase/PostgreSQL/FCM Cloud Backend, tailored for an academic Cloud Computing & Applications project.

**Architecture:** Distributed Cloud-Native Architecture leveraging PaaS (Supabase PostgreSQL, Auth, Realtime, Storage, Edge Functions), Cloud Messaging (Firebase Cloud Messaging), Location Cloud Services (Google Maps Platform & Flutter Geolocator), and static web/mobile clients.

**Tech Stack:** 
- Customer Web: HTML5, CSS3 (Modern Glassmorphic / Vibrance Design System), Vanilla JavaScript (ES6+), Supabase JS Client, Google Maps JS API.
- Driver App: Flutter 3.35+ / Dart 3.9+, Supabase Flutter SDK, Provider, Geolocator, Google Maps Flutter, Firebase Core/Messaging.
- Admin Web: HTML5, CSS3, Vanilla JS (ES6+), Chart.js / SVG, Supabase JS Client.
- Backend: Supabase PostgreSQL 15+, PL/pgSQL, Row Level Security (RLS), Supabase Edge Functions (Deno / TypeScript), Storage Buckets.
- Cloud Services: FCM, Google Maps Platform.

---

## Phased Execution Roadmap

### Phase 1: Project Foundation & Scaffolding
- [x] Create directory structure: `customer-web`, `driver-app`, `admin-web`, `supabase`, `docs`.
- [ ] Setup root `.gitignore`, `.env.example`, and comprehensive `README.md`.
- [ ] Configure environment setups for Web (`env.example.js`) and Flutter (`env.json.example`).
- [ ] Scaffold Flutter `driver-app` with dependencies (`supabase_flutter`, `provider`, `geolocator`, `google_maps_flutter`, etc.).
- [ ] Scaffold `customer-web` with standard modular structure (`index.html`, `css/`, `js/`).
- [ ] Scaffold `admin-web` with standard modular structure (`index.html`, `css/`, `js/`).
- [ ] Commit initial foundation to Git.

### Phase 2: Database Architecture, RLS & Seed Data
- [ ] Write `supabase/migrations/001_initial_schema.sql` containing all required relational entities:
  - `profiles` (with role: `CUSTOMER`, `DRIVER`, `ADMIN`)
  - `categories` (active status, image url)
  - `food_items` (price, availability, category_id)
  - `addresses` (user_id, lat, lng, is_default)
  - `drivers` (user_id, is_online, lat, lng, last_location_update)
  - `orders` (customer_id, driver_id, status, subtotal, delivery_fee, total_amount, payment_method, payment_status, coordinates)
  - `order_items` (order_id, food_id, quantity, unit_price, total_price)
  - `driver_locations` (driver_id, order_id, lat, lng, timestamp)
  - `notifications` (user_id, title, body, type, related_order_id, is_read)
  - `reviews` (order_id, customer_id, rating, comment)
- [ ] Write constraints, foreign keys, updated_at triggers, and automated `handle_new_user` profile trigger on `auth.users`.
- [ ] Implement strict Row Level Security (RLS) policies in `supabase/migrations/002_rls_policies.sql`.
- [ ] Implement seed data in `supabase/seed/seed.sql` for categories, food items, central kitchen metadata, and mock accounts.
- [ ] Validate schema syntax and SQL integrity.

### Phase 3: Supabase Authentication & Role-Based Access Control
- [ ] Build shared auth module and client wrapper for Web apps (`customer-web/js/supabaseClient.js`, `admin-web/js/supabaseClient.js`).
- [ ] Implement Customer Registration, Login, Session Management, and Role checking.
- [ ] Implement Admin Login with role restriction check (`role === 'ADMIN'`).
- [ ] Implement Driver Authentication service in Flutter (`lib/services/auth_service.dart`).
- [ ] Document Auth security flow in `docs/security/security.md`.

### Phase 4: Customer Web Application
- [ ] Modern UI Design System (`css/style.css`, glassmorphism, responsive navigation, badges, hero section).
- [ ] Home view with dynamic categories, featured items, and search/filter.
- [ ] Menu / Food Catalogue view with category filtering, real-time availability badges, modal food details.
- [ ] Cart management (add, remove, quantity increment/decrement, subtotal, delivery fee calculation).
- [ ] Address manager & delivery location selector.
- [ ] Checkout flow with Cash on Delivery and Test Mock Online Payment.
- [ ] Order placement transaction and order confirmation view.
- [ ] Order History view and Order Details modal.
- [ ] Customer Profile management and review submission dialog.

### Phase 5: Driver Flutter Application
- [ ] Configure Flutter dependencies in `pubspec.yaml` and Android permissions in `AndroidManifest.xml` (FINE_LOCATION, COARSE_LOCATION, INTERNET, FOREGROUND_SERVICE).
- [ ] Setup Flutter Theme, responsive design, and state management (Provider).
- [ ] Splash & Authentication screens (Login, Session restore).
- [ ] Driver Dashboard (Driver profile summary, Online/Offline toggle with real-time status update to DB).
- [ ] Available Deliveries screen (listing orders in `READY_FOR_PICKUP` or assigned to driver).
- [ ] Active Delivery screen with lifecycle controls:
  - Step 1: Accept Order -> `DRIVER_ASSIGNED`
  - Step 2: Navigate to Kitchen -> Arrived
  - Step 3: Pickup Food -> `PICKED_UP`
  - Step 4: Navigate to Customer -> `OUT_FOR_DELIVERY`
  - Step 5: Deliver -> `DELIVERED`
- [ ] Driver Profile & Delivery History screens.

### Phase 6: Admin Web Application
- [ ] Admin Dashboard UI with high-level KPI cards (Total Revenue, Total Orders, Active Orders, Online Drivers, Customer Count).
- [ ] Food Item Management (Add Food, Edit Food, Archive/Toggle availability, Category association).
- [ ] Category Management (Create, Edit, Toggle active).
- [ ] Order Management (Live order table, filter by status, search, detailed order inspector modal).
- [ ] Driver Management (List all drivers, view online status, current location timestamp, assign available driver to ready orders).
- [ ] Customer List & Reports overview.

### Phase 7: Integrated End-to-End Order Flow
- [ ] Connect all 3 applications through live Supabase backend.
- [ ] Validate order status transitions against state machine rules:
  `PLACED` -> `CONFIRMED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `DRIVER_ASSIGNED` -> `PICKED_UP` -> `OUT_FOR_DELIVERY` -> `DELIVERED` (and `CANCELLED`).
- [ ] Test order state enforcement preventing invalid skips.

### Phase 8: Realtime Engine
- [ ] Customer Web: Supabase Realtime channel on `orders` table filtering by `customer_id` — dynamic status stepper updates.
- [ ] Driver App: Realtime stream on orders and assigned deliveries.
- [ ] Admin Web: Realtime table updates for incoming orders and driver status changes.

### Phase 9: GPS & Live Location Tracking
- [ ] Driver Flutter App: Geolocator background/foreground service broadcasting GPS coordinates to `driver_locations` and updating `drivers.current_latitude / current_longitude`.
- [ ] Customer Web: Order Tracking screen embedding Google Maps / Leaflet fallback showing live driver marker moving in real-time towards customer location marker.
- [ ] Update rate limiting (every 5-10 seconds during `OUT_FOR_DELIVERY` to balance database load).

### Phase 10: Push Notifications Architecture
- [ ] Design Firebase Cloud Messaging (FCM) integration architecture.
- [ ] In-app notification bell & toast system in Web apps connected to `notifications` table.
- [ ] Driver Flutter FCM integration structure and background message handlers.
- [ ] Event-driven triggers for customer & driver notifications on order milestone transitions.

### Phase 11: Serverless Edge Functions
- [ ] `create-order`: Validates food item prices and stock server-side before order creation.
- [ ] `update-order-status`: Validates state transition permissions.
- [ ] `assign-driver`: Validates driver online status and assigns order.
- [ ] `send-notification`: FCM dispatch function.

### Phase 12: Academic Deliverables, Testing & Viva Documentation
- [ ] Verification and automated/manual test suite (`docs/testing/test-plan.md`).
- [ ] System Architecture & Sequence Diagrams (`docs/architecture/`).
- [ ] Database Schema & ER Diagrams (`docs/database/`).
- [ ] Cloud Concepts & SaaS / PaaS / IaaS academic mapping (`docs/cloud/`).
- [ ] Security & RLS documentation (`docs/security/`).
- [ ] Comprehensive Final Project Report (`docs/HomeVibes_Academic_Report.md`).
- [ ] Presentation Guide / Viva Voce Cheat-sheet (`docs/Viva_Preparation_Guide.md`).
