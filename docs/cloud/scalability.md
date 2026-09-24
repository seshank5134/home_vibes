# HomeVibes — Cloud Scalability & Elasticity Strategy

This guide articulates how the HomeVibes architecture scales from a single central kitchen prototype to a multi-city high-throughput enterprise delivery network.

---

## 1. Multi-Tier Scaling Strategies

### 1.1 Client Layer (Web & Mobile Edge)
- **Static Assets on Global CDNs:** HTML, CSS, JavaScript, and compiled Flutter web bundles are cached globally via Cloudflare / Vercel Edge caches. The database is never queried for static asset distribution.
- **Client-Side State Hydration:** Menus and category filters are cached locally in browser memory/localStorage with optimistic UI updates.

### 1.2 Compute Layer (Serverless Edge Functions)
- **Stateless Auto-Scaling:** As order demand spikes (e.g. lunch/dinner peak hours), Supabase Edge Functions scale elastically from 0 to thousands of concurrent isolates automatically without provisioning servers.

### 1.3 Database & Connection Pooling
- **PgBouncer Connection Pooling:** Prevents PostgreSQL connection exhaustion when thousands of client sockets connect concurrently. Transactions utilize temporary pooled connections that are returned immediately upon query completion.
- **B-Tree Indexes:** Dedicated indexes on `orders(customer_id)`, `orders(status)`, `driver_locations(order_id, timestamp)`, and `food_items(is_available)` ensure sub-millisecond query execution even with millions of rows.

### 1.4 GPS Stream Throttling
- **Rate-Limited Telemetry:** During active transit, the Flutter driver app transmits GPS coordinates every 5-10 seconds (or 10 meters distance filter) rather than every millisecond. This prevents saturation of the `driver_locations` table and avoids unnecessary database write amplification.
