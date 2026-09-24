# HomeVibes — Row Level Security (RLS) Policy Matrix

Row Level Security (RLS) in PostgreSQL ensures data isolation directly at the database engine level, guaranteeing that even if a client application is compromised, unauthorized reads and writes are blocked by the kernel.

---

## 1. Access Control Matrix

| Table | Operation | Customer Role | Driver Role | Admin Role | Anonymous (Public) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | SELECT | Own profile only | Own profile only | All profiles | ❌ Denied |
| | UPDATE | Own profile only | Own profile only | All profiles | ❌ Denied |
| | INSERT | Handled via trigger | Handled via trigger | Handled via trigger | ❌ Denied |
| **`categories`**| SELECT | ✅ All active | ✅ All active | ✅ All (active/inactive)| ✅ All active |
| | ALL (W) | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ Denied |
| **`food_items`**| SELECT | ✅ All available | ✅ All available | ✅ All (avail/unavail) | ✅ All available |
| | ALL (W) | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ Denied |
| **`addresses`** | SELECT | Own addresses | ❌ Denied | All addresses | ❌ Denied |
| | INSERT | With `user_id=auth.uid()` | ❌ Denied | ✅ Allowed | ❌ Denied |
| | UPDATE | Own addresses | ❌ Denied | ✅ Allowed | ❌ Denied |
| | DELETE | Own addresses | ❌ Denied | ✅ Allowed | ❌ Denied |
| **`drivers`** | SELECT | ❌ Denied | Own driver record | All drivers | ❌ Denied |
| | UPDATE | ❌ Denied | Own status/coords | All drivers | ❌ Denied |
| **`orders`** | SELECT | Own orders | Assigned or Available | All orders | ❌ Denied |
| | INSERT | With `customer_id=auth.uid()`| ❌ Denied | ✅ Allowed | ❌ Denied |
| | UPDATE | Cancel if `PLACED` | Assigned delivery status | All orders | ❌ Denied |
| **`order_items`**| SELECT | If parent order readable | If parent order readable | All items | ❌ Denied |
| | INSERT | If parent order belongs to user | ❌ Denied | ✅ Allowed | ❌ Denied |
| **`driver_locations`**| INSERT| ❌ Denied | Own driver GPS breadcrumbs | ✅ Allowed | ❌ Denied |
| | SELECT | If customer owns active order | Own breadcrumbs | All breadcrumbs | ❌ Denied |
| **`notifications`**| SELECT| Own notifications | Own notifications | Own notifications | ❌ Denied |
| | UPDATE | Own notifications (mark read) | Own notifications | Own notifications | ❌ Denied |
| **`reviews`** | SELECT | ✅ Public | ✅ Public | ✅ Public | ✅ Public |
| | INSERT | For delivered order owned | ❌ Denied | ✅ Allowed | ❌ Denied |

---

## 2. Key Security Functions Explained

### 2.1 `public.is_admin()`
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- Marked `SECURITY DEFINER` so it queries `profiles` with system privileges without exposing profiles to public manipulation.
- Cached per statement execution plan for high query performance.

### 2.2 `public.validate_order_status_transition()`
Enforces the strictly forward order state machine in database triggers:
```text
PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> DRIVER_ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED
```
Any attempt to skip states (e.g. `PLACED -> DELIVERED`) will result in a PostgreSQL `RAISE EXCEPTION`, rolling back the transaction.
