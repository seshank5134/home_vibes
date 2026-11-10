# SWE4004 — CLOUD COMPUTING AND ITS APPLICATIONS
## REVIEW-2 PRESENTATION SLIDE DECK & SPEAKER NOTES

**Project Title:** HomeVibes: A Cloud-Native Indian DIY Meal Kit Delivery & Real-Time Fleet Management Platform  
**Subtitle:** A three-tier system connecting customers, delivery partners, and hub administrators on a single Supabase-powered cloud backend.  

**SUBMITTED BY:**  
- **24MIC7062** — Vyshnavi  
- **24MIC7069** — Meghana  
- **24MIS7354** — Karthikeya  

**GUIDED BY:**  
Dr. M. Jawahar, Associate Professor Grade 2, VIT-AP University  

---

### Slide 1: Title Slide (Review-2)
- **Course:** SWE4004 — Cloud Computing and Its Applications
- **Review:** Review-2
- **Title:** HomeVibes: A Cloud-Native Indian DIY Meal Kit Delivery & Real-Time Fleet Management Platform
- **Scope Summary:** A three-tier system connecting customers, delivery partners, and hub administrators on a single Supabase-powered cloud backend.
- **Team:**
  - 24MIC7062 — Vyshnavi
  - 24MIC7069 — Meghana
  - 24MIS7354 — Karthikeya
- **Guide:** M. Jawahar, Associate Professor Grade 2, VIT-AP University

> **Speaker Notes:**  
> "Good morning, respected professors. Today we present Review-2 of our cloud computing project, HomeVibes. HomeVibes is a cloud-native platform connecting customers, delivery partners, and central hub administrators on a managed Supabase backend, solving the restaurant cooking delay bottleneck through an Indian DIY meal kit model."

---

### Slide 2: Problem Statement
- **Context:** Conventional food delivery depends on restaurant kitchens, which creates delay, quality loss, and poor operational visibility.
- **Key Challenges:**
  1. **High Delivery Latency:** Delivery time is dominated by kitchen preparation backlogs, often 45–60 minutes end to end.
  2. **Quality Degradation:** Cooked food loses freshness and texture during transit, and packaging cannot fully prevent it.
  3. **Fragmented Operations:** Customers, drivers, and admins lack one secure, real-time view of orders, stock, and vehicle location.
- **Core Problem:** There is no scalable, secure, and real-time cloud platform that removes the kitchen bottleneck by delivering pre-portioned raw-ingredient kits with cooking scripts, while giving every stakeholder live visibility.

> **Speaker Notes:**  
> "In conventional delivery, up to 60% of the total wait time happens in restaurant kitchens. Furthermore, cooked food degrades in transit, and systems suffer from fragmented operational views. HomeVibes addresses this directly."

---

### Slide 3: Objectives of the Project
1. **Design a Decoupled Three-Tier Cloud Architecture:** Customer web, driver mobile app, and admin console on one shared backend.
2. **Use Cloud Service Models Effectively:** Map the system to IaaS, PaaS, FaaS, and SaaS using Supabase as the managed platform.
3. **Model Orders in a Relational Cloud Database:** PostgreSQL schema with constraints, order state history, and driver locations.
4. **Enforce Security at the Data Layer:** Supabase Auth with role-based access and Row Level Security (RLS) policies.
5. **Deliver Real-Time Order and GPS Tracking:** Push updates over WebSockets instead of client polling.
6. **Automate Dispatch Through Serverless Logic:** Server-side functions for claiming, pickup, delivery, and failure handling.

> **Speaker Notes:**  
> "We established six core objectives covering architecture, service models, relational modeling, data-layer security, real-time WebSockets, and serverless workflow automation."

---

### Slide 4: Scope of the Project
- **In Scope:**
  - Customer web portal: browse meal kits, cart, checkout, order tracking.
  - Admin console: dashboard, order queue, driver assignment, catalogue, and stock.
  - Flutter driver app: shift toggle, order claim, live GPS, delivery status.
  - Supabase backend: database, auth, realtime, storage, serverless functions.
  - Bengaluru central hub with Indian meal kits priced in INR (₹).
- **Out of Scope / Future Work:**
  - Real payment gateway integration.
  - Multi-city and multi-hub expansion.
  - ML-based demand forecasting.
  - Cold-chain IoT sensors on delivery bags.
  - Multi-region read replicas.

> **Speaker Notes:**  
> "Our in-scope deliverables comprise the complete three-tier software ecosystem. Non-core items like banking gateways and IoT hardware sensors are identified as future enhancements."

---

### Slide 5: Literature Survey
| Related Work | Focus | Gap / Relevance to HomeVibes |
|---|---|---|
| **NIST SP 800-145:** The NIST Definition of Cloud Computing (Mell & Grance, 2011) | Defines essential cloud characteristics and the IaaS, PaaS, and SaaS service models. | Used as the basis for mapping HomeVibes components to service and deployment models. |
| **Supabase Documentation:** Auth, Row Level Security and Realtime | Open-source Postgres backend with database-level authorization and change-data-capture streaming. | Provides the platform; HomeVibes applies it to a role-based delivery workflow with live tracking. |
| **Firebase Documentation:** Firestore and Cloud Messaging | NoSQL backend-as-a-service with managed push notifications. | NoSQL is weaker for relational order data, so only FCM is adopted for notifications. |

> **Speaker Notes:**  
> "Our literature survey analyzed standard NIST definitions, PostgreSQL security with Supabase, and Firebase services. We specifically identified that relational integrity is essential for order and inventory transactions."

---

### Slide 6: Proposed Solution
- **Core Concept:** HomeVibes replaces cooked-food delivery with sealed Indian meal kits that are packed in minutes and cooked by the customer using step-by-step scripts.
- **Fulfillment Pipeline:**
  $$\text{Browse \& Order Kit} \rightarrow \text{Hub Packs Raw Ingredients} \rightarrow \text{Driver Claims \& Picks Up} \rightarrow \text{Live GPS Delivery} \rightarrow \text{Customer Cooks in 10–20 min}$$
- **Key Architectural Pillars:**
  - **Faster Dispatch:** No kitchen wait; sealed kits are ready for pickup as soon as packed (< 2 min).
  - **Secure & Real-Time:** Row Level Security protects data while WebSockets stream order status and driver location.
  - **Serverless & Managed:** Business logic runs in database and edge functions, eliminating server provisioning.

> **Speaker Notes:**  
> "Here is our 5-step fulfillment pipeline. Pre-portioned raw ingredient kits are packed in minutes, cutting out cooking wait time completely while delivering fresher, hotter food."

---

### Slide 7: Technology Stack
- **Cloud Platform:** Supabase (managed PaaS on AWS Mumbai)
- **Database:** PostgreSQL 15
- **Authentication:** Supabase Auth (JWT, roles)
- **Realtime:** Supabase Realtime (WebSockets)
- **Serverless:** Edge Functions (Deno / TypeScript) and PL/pgSQL functions
- **Storage:** Supabase Storage buckets
- **Customer & Admin Web:** HTML5, CSS3, JavaScript (ES6+)
- **Driver Mobile App:** Flutter and Dart
- **Maps & Tracking:** Leaflet / OpenStreetMap, device GPS
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Security:** Row Level Security, RBAC
- **Version Control:** Git / GitHub

> **Speaker Notes:**  
> "This table summarizes our full technology stack across all tiers, showing how open-source and managed cloud tools eliminate infrastructure overhead."

---

### Slide 8: System Architecture
- **Three-Tier Decoupled Topology:**
  - Customer Web App (HTML / CSS / JS)
  - Driver Mobile App (Flutter Android)
  - Admin Web Console (Dashboard & Dispatch)
- **Supabase Cloud Backend (PaaS):**
  - PostgreSQL 15 Engine
  - Auth + RLS
  - Realtime (CDC over WebSockets)
  - Edge / DB Functions
  - Cloud Storage
- **External Services:** Firebase Cloud Messaging, Map Tiles (OpenStreetMap / Leaflet).
- **End-to-End Flow:** Client $\rightarrow$ Supabase Auth (JWT) $\rightarrow$ RLS-protected PostgreSQL $\rightarrow$ Realtime broadcast $\rightarrow$ Subscribed clients.

> **Speaker Notes:**  
> "Our architecture is fully decoupled. All three client interfaces communicate with the managed Supabase PostgreSQL backend, protected by JWT authentication and Row Level Security."

---

### Slide 9: List of Modules & Brief Description
1. **Customer Web Module:** Browse kits, view recipe scripts, cart, checkout, and order history.
2. **Live Tracking Module:** Six-stage order timeline and driver marker on a live map.
3. **Admin Console Module:** Revenue and order metrics, dispatch queue, and driver assignment.
4. **Catalogue & Inventory Module:** Add or edit meal kits, price, spice level, and availability switch.
5. **Driver App Module:** Shift toggle, claim order, arrive, pick up, complete, or fail delivery.
6. **Auth & Security Module:** Roles: customer, driver, admin, enforced by Row Level Security.
- **Backed by Security-Definer DB Functions:** `claim_order`, `pickup_order`, `start_delivery`, `arrive_at_customer`, `complete_delivery`, and `fail_delivery`.

> **Speaker Notes:**  
> "Here are our six core functional modules. Notice that critical state changes are executed by security-definer database functions to ensure transactional consistency."

---

### Slide 10: Implementation: Database & Serverless Layer
- **Relational Tables:** `orders`, `order_items`, `order_status_history`, `drivers`, `driver_locations`, and `notifications`.
- **Order Tracking:** Each order stores pickup and delivery coordinates, fees, and a timestamp per status.
- **Database Functions:** Security-definer functions run the delivery workflow directly in the database (`arrive_at_kitchen`, `claim_order`, `pickup_order`, `start_delivery`, `complete_delivery`, `driver_toggle_online`, `driver_update_location`).
- **Cloud Deployment:** Deployed on the Supabase project `"home-vibes"` (main).

> **Speaker Notes:**  
> "This slide highlights our database implementation on Supabase. Relational tables store orders, order items, and GPS history, while security-definer functions enforce workflow execution."

---

### Slide 11: Implementation: Customer Web Portal
- **Landing Page:** Hero kit showcases, dietary tags (Vegetarian, Non-Veg), spice levels (Mild, Medium, High).
- **Meal Kit Catalogue:** Indian recipes (Hyderabadi Biryani ₹349, Paneer Butter Masala ₹249, Chettinad Pepper Chicken ₹329).
- **Recipe Scripts:** View sealed raw ingredient manifests and step-by-step chef cooking instructions.
- **Slide-Over Cart:** Real-time subtotal in INR (₹) with standard ₹40 hub delivery fee.

> **Speaker Notes:**  
> "The Customer Web Portal features responsive meal kit cards, clear diet and spice tags, and instant recipe inspection modals allowing users to view ingredients before ordering."

---

### Slide 12: Implementation: Live Delivery Tracking
- **Six Stages:** Placed $\rightarrow$ Confirmed $\rightarrow$ Packaging $\rightarrow$ Picked Up $\rightarrow$ Out for Delivery $\rightarrow$ Delivered.
- **Interactive Map:** Hub location, moving driver marker, and customer destination rendered via Leaflet / OpenStreetMap.
- **Driver Card:** Driver name (Ravi Kumar), vehicle details (Bajaj Chetak Electric KA-05-EV-4821).
- **Realtime Updates:** Location coordinates pushed via Supabase Realtime WebSockets.
- **Demo Support:** Built-in "Simulate GPS" button allows live evaluation without driving.

> **Speaker Notes:**  
> "Our live tracking module features a six-stage timeline and real-time Leaflet map. Location fixes are pushed via Supabase WebSockets, avoiding client polling overhead."

---

### Slide 13: Implementation: Admin Operations Console
- **Operations Dashboard:** Live KPI cards for Total Revenue (₹18,450), Active Orders (4), Online Fleet Drivers (2), and Registered Customers (24).
- **Live Dispatch Queue:** Order search, assign driver action, and advance status progression.
- **Simulate Order:** Quick demo trigger to generate simulated incoming orders.

> **Speaker Notes:**  
> "The Admin Console displays high-level operational KPIs in Indian Rupees, active dispatches, and an interactive queue allowing hub managers to assign drivers with one click."

---

### Slide 14: Implementation: Catalogue & Inventory Management
- **Inventory Table:** Manage meal kit name, category, price in ₹, cook time, spice level, and availability.
- **Instant Availability Switch:** Toggling the availability switch instantly updates `food_items.is_available` in PostgreSQL, hiding or displaying the kit on customer browsers via Realtime.

> **Speaker Notes:**  
> "Hub managers can adjust prices and toggle inventory availability in real time. Toggling an item immediately propagates to all connected customer browsers through Supabase Realtime."

---

### Slide 15: Conclusion & Wrap-Up
- **Achieved So Far:** Working customer portal, admin console, and live tracking prototype on a managed Supabase cloud database with role-based security.
- **Cloud Concepts Demonstrated:** IaaS, PaaS, FaaS, and SaaS mapping, Row Level Security, realtime streaming, and serverless business logic.
- **Remaining Work:** Complete the Flutter driver app production build, push notifications, and end-to-end load testing.
- **Future Enhancements:** Demand forecasting with ML, cold-chain IoT sensors, and multi-region read replicas (Mumbai, Singapore).

> **Speaker Notes:**  
> "In conclusion, HomeVibes demonstrates an operational cloud-native architecture combining PaaS, FaaS, and mobile edge computing. Thank you professors, we are now ready for questions."

---

### Slide 16: References
1. P. Mell and T. Grance, "The NIST Definition of Cloud Computing," *NIST Special Publication 800-145*, 2011.
2. Supabase Documentation: Auth, Row Level Security, Realtime and Edge Functions. `supabase.com/docs`
3. PostgreSQL 15 Documentation. `postgresql.org/docs/15`
4. Firebase Documentation: Cloud Messaging (FCM). `firebase.google.com/docs`
5. Flutter Documentation. `docs.flutter.dev`
6. Leaflet Documentation and OpenStreetMap. `leafletjs.com`, `openstreetmap.org`

> **Speaker Notes:**  
> "Here are our key academic and technical references. Thank you professors for your time and guidance."
