# HomeVibes — Cloud Services & Computing Concepts Analysis

**Project Domain:** Cloud Computing & Distributed Applications  
**Cloud Paradigm:** PaaS-Centric Event-Driven Micro-Services Architecture

---

## 1. Cloud Service Model Mapping (SaaS / PaaS / IaaS)

An essential viva evaluation question involves distinguishing between SaaS, PaaS, and IaaS within the HomeVibes ecosystem:

### 1.1 Software-as-a-Service (SaaS)
* **What is it:** Fully functional applications delivered over the internet directly to end-users without requiring local compilation or operating system dependencies.
* **HomeVibes Implementation:**
  - The **Customer Web Application** (browsing delicacies, ordering, live GPS tracking).
  - The **Admin Operations Console** (order dispatching, fleet management, analytical reporting).
  - Both delivered as ready-to-use cloud services accessed via standard web browsers.

### 1.2 Platform-as-a-Service (PaaS)
* **What is it:** Managed cloud platforms providing development frameworks, automated scaling, database engines, and runtime environments without low-level server provisioning.
* **HomeVibes Implementation:**
  - **Supabase Cloud:** Provides the managed PostgreSQL 15 database instance, automated connection poolers (PgBouncer), authentication infrastructure, and Realtime WebSocket cluster.
  - **Firebase Cloud Messaging (FCM):** PaaS push notification pipeline handling mobile device token registration, push sockets, and retry policies.
  - **Google Maps Platform:** PaaS geospatial engine providing geocoding, tile rendering, and distance matrix services.

### 1.3 Infrastructure-as-a-Service (IaaS)
* **What is it:** The fundamental compute instances, virtual networking, block storage, and data centers on which cloud platforms execute.
* **HomeVibes Attribution:**
  - While HomeVibes developers do not manage raw EC2 virtual machines directly (relying on PaaS abstractions), the underlying Supabase infrastructure runs on AWS (Elastic Compute Cloud, Amazon EBS storage, and Amazon VPCs across availability zones).

---

## 2. Cloud Computing Concepts Matrix

| Academic Concept | Practical HomeVibes Implementation | Viva Defense Justification |
| :--- | :--- | :--- |
| **Cloud Relational Database** | PostgreSQL 15 on Supabase | ACID compliant relational storage with foreign key constraints, triggers, and automated WAL replication. |
| **Cloud Identity & Auth** | Supabase Auth (OAuth / JWT) | Stateless JSON Web Tokens containing encrypted role claims (`CUSTOMER`, `DRIVER`, `ADMIN`). |
| **Object Cloud Storage** | Supabase Storage Buckets | S3-compatible cloud object store for food photographs and driver documentation. |
| **Serverless Computing** | Supabase Edge Functions | Event-triggered, ephemeral Deno runtimes (`create-order`, `assign-driver`) executing near the user. |
| **Realtime Push Communication** | Supabase Realtime | WebSocket engine capturing PostgreSQL Write-Ahead Logs (WAL) for sub-second client updates. |
| **Mobile Cloud Computing** | Flutter Driver Android App | Edge client utilizing GPS hardware to stream breadcrumbs to the cloud backend. |
| **Geospatial Cloud Services** | Google Maps / OpenStreetMap | Cloud spatial APIs calculating routes and rendering live maps for customers. |
| **Data Governance & Security** | Row Level Security (RLS) | Database-level multitenancy preventing data leakage across unauthorized users. |
| **Scalability & Elasticity** | Connection Pooling & Micro-frontends | Decoupled client architectures that scale independently from the database tier. |
