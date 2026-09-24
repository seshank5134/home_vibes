# HomeVibes — Serverless Edge Computing & FaaS Architecture

**Runtime Environment:** Deno (V8 Isolate Engine)  
**Execution Paradigm:** Function-as-a-Service (FaaS)  
**Deployment Region:** Global Edge Network (Supabase Edge)

---

## 1. Why Serverless Edge Functions?

In traditional client-server web apps, running a 24/7 dedicated Node.js/Express server introduces:
- Idle compute billing costs when no orders are being processed.
- Server maintenance, OS patching, and security vulnerabilities.
- Cold start latency and centralized data transfer bottlenecks.

HomeVibes replaces traditional server processes with **stateless Edge Functions**:
1. **`create-order`**: Validates dish availability and locks prices server-side.
2. **`update-order-status`**: Enforces role permissions and the order state machine.
3. **`assign-driver`**: Validates driver online status and dispatches notification.
4. **`send-notification`**: Bridges database events with Firebase Cloud Messaging (FCM).

---

## 2. V8 Isolates vs. Container Virtualization

Unlike AWS Lambda or Docker containers which spin up virtual machines or containers (introducing 500ms - 2s cold starts), Supabase Edge Functions execute inside **V8 Isolates**:
- Startup latency is **< 15 milliseconds**.
- Minimal memory footprint (~20 MB vs ~500 MB for a container).
- Functions execute globally at edge points-of-presence (PoPs) closest to the requesting user.
