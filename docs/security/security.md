# HomeVibes — Cloud Security & Governance Specification

---

## 1. Zero-Trust Security Posture

HomeVibes implements defense-in-depth across every architectural tier:

```text
CLIENT TIER           GATEWAY TIER            COMPUTE TIER            DATABASE ENGINE
[ Browser / Flutter ] -> [ Supabase API Gateway ] -> [ Edge Functions ] -> [ PostgreSQL Kernel ]
      │                        │                            │                      │
Input Validation         HTTPS / TLS 1.3              Stateless JWT          Row Level Security (RLS)
No Service Keys          CORS Enforcement             Price Locks            Check Constraints
```

---

## 2. Key Security Safeguards

### 2.1 Credential & Key Segregation
- **Anon Public Key:** Only possesses privileges granted by RLS policies. It is safe for inclusion in client web and mobile apps.
- **Service Role Secret Key:** Kept strictly inside server-side Edge Functions environment variables (`SUPABASE_SERVICE_ROLE_KEY`). Never committed to Git or bundled in client builds.
- **`.gitignore` Enforcement:** All `.env`, `env.js`, `google-services.json`, and keystores are excluded from source control.

### 2.2 Row Level Security (RLS)
- Every table has `ROW LEVEL SECURITY` activated.
- Customers can only read and insert their own records (`auth.uid() = customer_id`).
- Fleet Drivers can only access orders assigned to them or marked `READY_FOR_PICKUP`.
- Admins possess verified administrative roles via the `public.is_admin()` security definer function.

### 2.3 SQL Injection Prevention
- PostgREST and the Supabase JavaScript / Dart SDKs use parameterized SQL queries exclusively. Unsanitized strings are never concatenated into dynamic SQL statements.

### 2.4 Order State Machine Hardening
- Forward transitions are strictly enforced via the PostgreSQL database trigger `validate_order_status_transition()`.
- Invalid status jumps (e.g. `PLACED -> DELIVERED`) are rejected with database exceptions, protecting against rogue API callers.
