# HomeVibes — Cloud-Native Food Delivery Application

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Flutter%20Android-green.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Supabase%20%7C%20PostgreSQL%2015-3ECF8E.svg)]()
[![Cloud](https://img.shields.io/badge/Cloud-Serverless%20%7C%20FCM%20%7C%20Google%20Maps-orange.svg)]()

> A production-grade, three-tier cloud-native online food delivery ecosystem designed from zero for the **Cloud Computing & Applications** curriculum and production showcase.

---

## 1. Project Overview & Business Model

**HomeVibes** operates on a central kitchen model connecting hungry customers, delivery fleet partners, and management administrators through an event-driven, real-time cloud backend:

```text
                    HOMEVIBES CLOUD PLATFORM
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        Customer Web     Driver Mobile     Admin Web
       (Responsive)     (Flutter Android) (Dashboard)
               │               │               │
               └───────────────┼───────────────┘
                               ▼
                    Central Kitchen Hub
                               ▼
                       Fleet Driver
                               ▼
                      End Customer
```

---

## 2. Cloud Architecture & Technology Mapping

This project explicitly demonstrates practical enterprise cloud computing concepts:

| Cloud Computing Concept | HomeVibes Implementation | Architecture Layer |
| :--- | :--- | :--- |
| **Cloud Relational Database** | PostgreSQL 15 on Supabase with Indexes & Constraints | Storage & Data Layer |
| **Cloud Authentication** | Supabase Auth (JWT, Role Claims, Session Handling) | Security Layer |
| **Realtime Push & Events** | Supabase Realtime (WebSockets, Postgres CDC) | Communication Layer |
| **Object Cloud Storage** | Supabase Storage Buckets (Food, Categories, Avatars) | Storage Layer |
| **Serverless Computing** | Supabase Edge Functions (Deno / TypeScript runtime) | Compute Layer |
| **Push Notification Service** | Firebase Cloud Messaging (FCM) HTTP v1 API | Notification Layer |
| **Mobile Cloud Computing** | Flutter Driver App with Foreground GPS Service | Mobile / Edge Layer |
| **Location Cloud Services** | Google Maps Platform (JavaScript API + Flutter Maps) | Location Layer |
| **Security & Privacy** | Row Level Security (RLS) & Role-Based Access Control | Governance Layer |

---

## 3. Cloud Service Model Mapping (SaaS / PaaS / IaaS)

* **SaaS (Software-as-a-Service):** 
  HomeVibes delivers end-to-end food ordering, live driver dispatching, and restaurant analytics over the internet directly to end-users without requiring local software installation or server maintenance.
* **PaaS (Platform-as-a-Service):** 
  Supabase provides the managed database engine, auto-scaling auth, edge function runtimes, and real-time pub/sub infrastructure. Developers write business logic rather than provisioning database clustering or socket servers.
* **IaaS (Infrastructure-as-a-Service):** 
  The underlying multi-zone compute, block storage, and virtual network boundaries (AWS / GCP underlying data centers) supporting the managed PaaS layer.

---

## 4. Repository Structure

```text
homevibes/
│
├── customer-web/             # Modern Vanilla HTML5/CSS3/ES6+ responsive customer portal
│   ├── css/                  # Curated glassmorphism design system & animations
│   ├── js/                   # Supabase client, auth, cart, maps & realtime handlers
│   └── index.html            # Single Page Application with dynamic views
│
├── driver-app/               # Flutter Android application for delivery partners
│   ├── lib/                  # Dart models, providers, services, screens & widgets
│   ├── android/              # Native Android configuration, permissions & FCM
│   └── pubspec.yaml          # Dependencies: supabase_flutter, geolocator, google_maps
│
├── admin-web/                # Web-based management dashboard
│   ├── css/                  # Professional dark/light analytical design system
│   ├── js/                   # Food/Category CRUD, Order dispatch, Driver monitoring
│   └── index.html            # Analytics, live order queue & driver assignment
│
├── supabase/                 # Cloud backend specifications
│   ├── migrations/           # PostgreSQL schema, constraints, triggers, indexes, RLS
│   ├── functions/            # Supabase Edge Functions (create-order, assign-driver, etc.)
│   ├── seed/                 # Realistic seed data (categories, food items, kitchen)
│   └── config/               # Project configuration
│
├── docs/                     # Comprehensive Academic Documentation
│   ├── architecture/         # System diagrams, sequence diagrams, cloud topology
│   ├── database/             # ER diagrams, schema data dictionary, RLS matrix
│   ├── cloud/                # Cloud concept analysis, scaling & PaaS evaluation
│   ├── api/                  # API contracts and Edge Function documentation
│   ├── security/             # Threat model, data privacy, RLS policies
│   ├── testing/              # Test plan, execution logs, verification criteria
│   └── plans/                # Phased master implementation plan
│
├── .env.example              # Central environment variables template
└── README.md                 # Project root documentation
```

---

## 5. Quick Start & Setup Guide

### Prerequisites
- Modern Web Browser (Chrome, Firefox, Edge)
- Flutter SDK (v3.24+ recommended) and Android Studio / Android SDK (for Driver App)
- Supabase Account (Free tier at [supabase.com](https://supabase.com))

### Step 1: Clone & Configure Workspace
```bash
cd homevibes
cp .env.example .env
```

### Step 2: Database Setup
1. Go to your Supabase Project Dashboard -> **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` to establish tables, triggers, and functions.
3. Run `supabase/migrations/002_rls_policies.sql` to activate Row Level Security.
4. Run `supabase/seed/seed.sql` to seed central kitchen categories, food items, and demo profiles.

### Step 3: Run Applications
- **Customer Web**: Open `customer-web/index.html` or serve via any static web server (e.g. `npx serve customer-web`).
- **Admin Web**: Open `admin-web/index.html` or serve via `npx serve admin-web`.
- **Driver Mobile**: `cd driver-app && flutter pub get && flutter run`.

---

## 6. Development Team & Academic Attribution
Developed for the **Cloud Computing & Applications** laboratory and lecture course evaluation.
Demonstrating hands-on cloud-native engineering, full-stack reactive design, and zero-compromise security.
