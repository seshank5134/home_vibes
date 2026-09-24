# HomeVibes — Cloud API & Edge Functions Reference

---

## 1. PostgREST Database Endpoints

All endpoints require the `apikey` header and an optional `Authorization: Bearer <JWT>` header.

### 1.1 Categories
* **`GET /rest/v1/categories?select=*&is_active=eq.true&order=display_order.asc`**
  - Response: Array of active category objects.
* **`POST /rest/v1/categories`** *(Admin Only)*
  - Body: `{ name, description, image_url, display_order }`

### 1.2 Food Items
* **`GET /rest/v1/food_items?select=*,categories(name)&is_available=eq.true`**
  - Response: Array of available delicacies with category name.
* **`PATCH /rest/v1/food_items?id=eq.<ID>`** *(Admin Only)*
  - Body: `{ is_available: false, price: 14.99 }`

### 1.3 Orders
* **`GET /rest/v1/orders?select=*,order_items(*,food_items(name))`**
  - Filtered automatically by Row Level Security based on caller's identity!
* **`POST /rest/v1/orders`**
  - Inserts new order row with `customer_id = auth.uid()`.

---

## 2. Serverless Edge Functions

### 2.1 Create Order
* **URL:** `POST /functions/v1/create-order`
* **Headers:** `Authorization: Bearer <USER_JWT>`, `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "items": [
      { "id": "f1111111-0001-0000-0000-000000000001", "quantity": 2 }
    ],
    "deliveryAddress": "100 Feet Road, Indiranagar, Bengaluru",
    "deliveryLat": 12.9784,
    "deliveryLng": 77.6408,
    "paymentMethod": "CASH_ON_DELIVERY",
    "deliveryNotes": "Buzzer #402"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "order": {
      "id": "ord-uuid",
      "order_number": "HV-849201",
      "status": "PLACED",
      "total_amount": 28.48
    }
  }
  ```

### 2.2 Assign Driver
* **URL:** `POST /functions/v1/assign-driver`
* **Headers:** `Authorization: Bearer <ADMIN_JWT>`
* **Request Body:**
  ```json
  {
    "orderId": "ord-uuid",
    "driverId": "driver-uuid"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "order": {
      "id": "ord-uuid",
      "status": "DRIVER_ASSIGNED",
      "driver_id": "driver-uuid"
    }
  }
  ```
