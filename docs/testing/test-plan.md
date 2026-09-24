# HomeVibes — Test Plan & Quality Assurance Matrix

**Scope:** End-to-end testing across Customer Web, Flutter Driver App, Admin Web Console, and Supabase Cloud Backend.

---

## 1. Test Verification Suite

### 1.1 Customer Web Application
| Test ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-CW-01** | User registration and login | Profile stored in `profiles`, session saved in localStorage | ✅ PASSED |
| **TC-CW-02** | Browse categories & search food | Instant real-time filtering without page reloads | ✅ PASSED |
| **TC-CW-03** | Cart management & price calculation | Correct subtotal, delivery fee applied (free > $35), badge counter updates | ✅ PASSED |
| **TC-CW-04** | Order checkout with address | Order record created in `orders` and `order_items`, cart cleared | ✅ PASSED |
| **TC-CW-05** | Real-time order tracking & Map | Stepper reflects status transitions live; Leaflet map moves driver marker | ✅ PASSED |
| **TC-CW-06** | Post-delivery review submission | Rating and comment saved to `reviews` table | ✅ PASSED |

### 1.2 Driver Flutter Android Application
| Test ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-DA-01** | Driver login & session restore | Driver profile hydrated, directs to Dashboard | ✅ PASSED |
| **TC-DA-02** | Online / Offline toggle | `drivers.is_online` updated in PostgreSQL, controls delivery visibility | ✅ PASSED |
| **TC-DA-03** | Available deliveries queue | Shows orders in `READY_FOR_PICKUP` status | ✅ PASSED |
| **TC-DA-04** | Accept delivery | Order transitions to `DRIVER_ASSIGNED`, driver linked in DB | ✅ PASSED |
| **TC-DA-05** | Lifecycle progression | Advances through `PICKED_UP` -> `OUT_FOR_DELIVERY` -> `DELIVERED` | ✅ PASSED |
| **TC-DA-06** | GPS location broadcasting | Throttled coordinates pushed to `driver_locations` during active transit | ✅ PASSED |

### 1.3 Admin Web Dashboard
| Test ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-AW-01** | KPI metrics calculation | Total revenue, active orders, online drivers match database counts | ✅ PASSED |
| **TC-AW-02** | Live orders queue filtering | Filters orders by `PLACED`, `PREPARING`, `READY_FOR_PICKUP`, etc. | ✅ PASSED |
| **TC-AW-03** | Manual driver assignment | Driver selected from online fleet, order moves to `DRIVER_ASSIGNED` | ✅ PASSED |
| **TC-AW-04** | Food inventory availability toggle | Instantly sets `is_available` in PostgreSQL; hides from customer menu | ✅ PASSED |

### 1.4 Cloud Backend & Database
| Test ID | Test Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-DB-01** | Row Level Security (RLS) | Customer cannot access another customer's orders; anonymous writes blocked | ✅ PASSED |
| **TC-DB-02** | State machine trigger enforcement | Invalid transition (e.g. `PLACED -> DELIVERED`) rejected by PostgreSQL | ✅ PASSED |
| **TC-DB-03** | Notification trigger | Status update inserts automated row in `notifications` table | ✅ PASSED |
