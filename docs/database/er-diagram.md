# HomeVibes — Entity-Relationship (ER) Diagram

**Database Engine:** PostgreSQL 15 (Supabase Cloud)  
**Relational Normalization:** 3NF (Third Normal Form)

---

## 1. Complete Entity-Relationship Model

```mermaid
erDiagram
    PROFILES ||--o{ ADDRESSES : "owns (1:N)"
    PROFILES ||--o{ ORDERS : "places (1:N)"
    PROFILES ||--o| DRIVERS : "specializes to (1:1)"
    PROFILES ||--o{ NOTIFICATIONS : "receives (1:N)"
    PROFILES ||--o{ REVIEWS : "writes (1:N)"

    CATEGORIES ||--o{ FOOD_ITEMS : "classifies (1:N)"

    DRIVERS ||--o{ ORDERS : "delivers (1:N)"
    DRIVERS ||--o{ DRIVER_LOCATIONS : "broadcasts (1:N)"

    ORDERS ||--|{ ORDER_ITEMS : "composed of (1:N)"
    ORDERS ||--o| REVIEWS : "evaluated by (1:1)"
    ORDERS ||--o{ DRIVER_LOCATIONS : "tracked during (1:N)"

    FOOD_ITEMS ||--o{ ORDER_ITEMS : "sold as (1:N)"

    PROFILES {
        UUID id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR role
        TEXT profile_image
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CATEGORIES {
        UUID id PK
        VARCHAR name UK
        TEXT description
        TEXT image_url
        BOOLEAN is_active
        INTEGER display_order
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    FOOD_ITEMS {
        UUID id PK
        UUID category_id FK
        VARCHAR name
        TEXT description
        NUMERIC price
        TEXT image_url
        BOOLEAN is_available
        BOOLEAN is_featured
        NUMERIC rating
        INTEGER rating_count
        INTEGER prep_time_minutes
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ADDRESSES {
        UUID id PK
        UUID user_id FK
        VARCHAR label
        TEXT address
        NUMERIC latitude
        NUMERIC longitude
        BOOLEAN is_default
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    DRIVERS {
        UUID id PK
        UUID user_id FK
        VARCHAR vehicle_type
        VARCHAR vehicle_number
        BOOLEAN is_online
        NUMERIC current_latitude
        NUMERIC current_longitude
        TIMESTAMPTZ last_location_update
        NUMERIC rating
        INTEGER total_deliveries
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ORDERS {
        UUID id PK
        VARCHAR order_number UK
        UUID customer_id FK
        UUID driver_id FK
        VARCHAR status
        NUMERIC subtotal
        NUMERIC delivery_fee
        NUMERIC total_amount
        TEXT delivery_address
        NUMERIC delivery_latitude
        NUMERIC delivery_longitude
        VARCHAR payment_method
        VARCHAR payment_status
        TEXT delivery_notes
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID food_id FK
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_price
    }

    DRIVER_LOCATIONS {
        UUID id PK
        UUID driver_id FK
        UUID order_id FK
        NUMERIC latitude
        NUMERIC longitude
        TIMESTAMPTZ timestamp
    }

    NOTIFICATIONS {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT body
        VARCHAR type
        UUID related_order_id FK
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }

    REVIEWS {
        UUID id PK
        UUID order_id FK
        UUID customer_id FK
        INTEGER rating
        TEXT comment
        TIMESTAMPTZ created_at
    }
```
