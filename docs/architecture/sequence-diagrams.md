# HomeVibes — End-to-End Sequence Diagrams

This document illustrates the message passing and asynchronous cloud events across all actors and subsystems.

---

## 1. Complete Order to Delivery Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Web)
    participant CloudDB as Supabase PostgreSQL
    participant Realtime as Supabase Realtime (WSS)
    actor Admin as Kitchen Admin (Web)
    actor Driver as Fleet Driver (Flutter)
    participant FCM as Firebase Cloud Messaging

    %% 1. Placing Order
    Customer->>CloudDB: Place Order (status: PLACED)
    CloudDB->>CloudDB: Trigger validate_order_status_transition()
    CloudDB->>Realtime: Broadcast 'INSERT' event on orders
    Realtime-->>Admin: New Order Notification on Dashboard

    %% 2. Kitchen Processing
    Admin->>CloudDB: Update status -> CONFIRMED & PREPARING
    CloudDB->>CloudDB: Trigger notify_on_order_status_change()
    CloudDB->>Realtime: Broadcast status change
    Realtime-->>Customer: Stepper updates to 'Cooking in Progress'

    %% 3. Ready & Driver Dispatch
    Admin->>CloudDB: Update status -> READY_FOR_PICKUP
    Admin->>CloudDB: Assign Driver Ravi (status: DRIVER_ASSIGNED)
    CloudDB->>FCM: Dispatch push notification to driver device
    FCM-->>Driver: Alert: "New Delivery Assigned! Head to kitchen"
    Realtime-->>Customer: Stepper updates to 'Driver Assigned'

    %% 4. Pickup & In Transit
    Driver->>CloudDB: Advance status -> PICKED_UP
    Driver->>CloudDB: Advance status -> OUT_FOR_DELIVERY
    Realtime-->>Customer: Stepper updates to 'Out for Delivery'

    %% 5. Live GPS Streaming Loop
    loop Every 5-10 Seconds
        Driver->>CloudDB: Insert GPS coordinates (lat, lng) to driver_locations
        CloudDB->>Realtime: Stream coordinate breadcrumb
        Realtime-->>Customer: Smoothly move driver icon on interactive map
    end

    %% 6. Arrival & Completion
    Driver->>CloudDB: Advance status -> DELIVERED
    CloudDB->>Realtime: Broadcast 'DELIVERED'
    Realtime-->>Customer: Show "Delivered! Rate Your Meal" dialog
    Customer->>CloudDB: Submit 5-star review
```
