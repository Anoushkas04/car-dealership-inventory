# 🚗 Apex Motors — Car Dealership Inventory System

[![Tests](https://img.shields.io/badge/Tests-38%20Passed-brightgreen)](https://github.com/Anoushkas04/car-dealership-inventory)
[![TDD](https://img.shields.io/badge/Methodology-TDD%20Red--Green--Refactor-blue)](https://github.com/Anoushkas04/car-dealership-inventory)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20TypeScript%20%7C%20Express-green)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(Persistent%20WAL)-orange)](https://sqlite.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Tailwind%20CSS-cyan)](https://react.dev/)

A full-stack, test-driven **Car Dealership Inventory System** built with **Node.js, TypeScript, Express, SQLite, React, and Tailwind CSS**. Designed adhering to SOLID principles, clean layered architecture, and strict Red-Green-Refactor Test-Driven Development (TDD).

---

## 📋 Table of Contents
1. [System Architecture & Features](#-system-architecture--features)
2. [Tech Stack](#-tech-stack)
3. [REST API Documentation](#-rest-api-documentation)
4. [TDD Methodology & Git Journey](#-tdd-methodology--git-journey)
5. [Test Suite Report](#-test-suite-report)
6. [Getting Started (Local Setup)](#-getting-started-local-setup)
7. [Default Seed Credentials](#-default-seed-credentials)
8. [Application Screenshots & UI Overview](#-application-screenshots--ui-overview)
9. [My AI Usage (Mandatory Section)](#-my-ai-usage-mandatory-section)

---

## 🏛 System Architecture & Features

```
car-dealership-inventory/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP request handling & status code mapping
│   │   ├── services/         # Core business logic & invariant validation
│   │   ├── repositories/     # Data persistence abstraction (SQL queries)
│   │   ├── db/               # SQLite connection (WAL mode) & seeder
│   │   ├── middleware/       # JWT verification & role-based authorization
│   │   ├── models/           # TypeScript domain entities and DTOs
│   │   ├── types/            # Decoupled IDatabase interfaces
│   │   ├── app.ts            # Express application bootstrap
│   │   └── server.ts         # Server entrypoint (Port 5001)
│   └── tests/                # Automated Vitest/Supertest TDD test suites
│       ├── auth.test.ts      # Authentication tests (9 tests)
│       ├── vehicles.test.ts  # Vehicle CRUD & RBAC tests (11 tests)
│       ├── search.test.ts    # Search & multi-parameter filtering (9 tests)
│       └── inventory.test.ts # Purchase decrement & restocking (9 tests)
│
├── frontend/                 # Modern React 18 + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/       # Navbar, HeroSection, FilterBar, VehicleCard, Modals
│   │   ├── context/          # AuthContext for JWT persistence & role state
│   │   ├── services/         # Typed API client
│   │   ├── types/            # Shared TypeScript frontend types
│   │   ├── App.tsx           # Dealership catalog dashboard & action handler
│   │   └── main.tsx          # React application entry
│   └── vite.config.ts        # Vite build tool with backend proxy (/api -> :5001)
│
├── PROMPTS.md                # Raw unedited AI interaction logs
└── README.md                 # Complete project documentation
```

### Key Highlights
- **Persistent Database**: Uses a real file-based SQLite database (`dealership.sqlite`) with write-ahead logging (WAL) for concurrency. Meets the requirement that in-memory databases are not sufficient.
- **Role-Based Access Control (RBAC)**: Enforces customer vs admin privileges. Destructive operations (vehicle deletion) and restocking are restricted to Admins (HTTP 403 Forbidden).
- **Out-of-Stock Protection**: Automatically disables the purchase button on vehicles with `quantity: 0`, and rejects server-side purchase attempts with HTTP 400 Bad Request.
- **Multi-Parameter Search & Filtering**: Filter by make, model, category, minimum price, maximum price, or universal keyword search.
- **Instant 1-Click Evaluation**: Pre-seeded demo credentials allow reviewers to switch between Customer and Admin roles in 1 click.

---

## 🛠 Tech Stack

- **Backend**: Node.js (v20+), TypeScript 5.7, Express 4.21, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `uuid`.
- **Database**: Native SQLite (`node:sqlite`) with persistent disk storage and WAL journaling.
- **Testing**: `Vitest`, `Supertest`, `@types/supertest`.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite 6, `lucide-react`.

---

## 📡 REST API Documentation

Base URL: `http://localhost:5001/api`

### 1. Authentication (Public)
| Method | Endpoint | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `POST` | `/auth/register` | Register new user or admin | `{ "username": "jane", "password": "secret", "role": "user" \| "admin" }` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/auth/login` | Authenticate and get JWT | `{ "username": "jane", "password": "secret" }` | `200 OK`, `400 Bad Request`, `401 Unauthorized` |

### 2. Vehicles (Protected — Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description | Guard | Status Codes |
|---|---|---|---|---|
| `GET` | `/vehicles` | View all available vehicles | Authenticated | `200 OK`, `401 Unauthorized` |
| `GET` | `/vehicles/search` | Search vehicles by query params (`make`, `model`, `category`, `minPrice`, `maxPrice`, `search`) | Authenticated | `200 OK`, `401 Unauthorized` |
| `GET` | `/vehicles/:id` | View specific vehicle details | Authenticated | `200 OK`, `404 Not Found` |
| `POST` | `/vehicles` | Add new vehicle to inventory | Authenticated | `201 Created`, `400 Bad Request` |
| `PUT` | `/vehicles/:id` | Update vehicle details | Authenticated | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/vehicles/:id` | Delete vehicle from inventory | **Admin Only** | `200 OK`, `403 Forbidden`, `404 Not Found` |

### 3. Inventory Operations (Protected — Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description | Guard | Status Codes |
|---|---|---|---|---|
| `POST` | `/vehicles/:id/purchase` | Purchase vehicle (decrements stock by 1). Fails if out of stock (`quantity === 0`) | Authenticated | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/vehicles/:id/restock` | Restock vehicle (increments stock). Accepts `{ "quantity": number }` | **Admin Only** | `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |

---

## 🔄 TDD Methodology & Git Journey

Every backend feature was implemented strictly using the **Red-Green-Refactor** pattern:
1. **Red**: Wrote comprehensive unit/integration test suites that initially failed because the endpoints/models did not yet exist.
2. **Green**: Implemented the minimal production code necessary to satisfy all test assertions and edge cases.
3. **Refactor**: Cleaned up abstractions, introduced repository interfaces, and decoupled database drivers.

### Git Commit Log Narrating the TDD Journey

```
* 2093835 feat(frontend): Implement single-page React dealership inventory application
* 44c323c feat(backend): Add server entrypoint and database seeder
* cbe9e4a refactor(backend): Decouple database repository access using IDatabase contract
* 64f5173 feat(inventory): Implement purchase decrement and admin restock endpoints (GREEN)
* 03f7b58 test(inventory): Add TDD test suite for vehicle purchase and restocking (RED)
* bdedbf8 feat(search): Add comprehensive tests and search endpoint implementation for vehicles (RED & GREEN)
* e3ea921 feat(vehicles): Implement vehicle CRUD endpoints with role-based authorization (GREEN)
* 39a2439 test(vehicles): Add test suite for vehicle CRUD and role-based permissions (RED)
* fd3ee2d feat(auth): Implement user registration and JWT authentication endpoints (GREEN)
* e33e0c1 test(auth): Add unit and integration tests for user registration and login (RED)
* f5128c9 chore: Initialize Car Dealership Inventory System project scaffold
```

Every commit with AI tool assistance includes the mandatory co-authorship trailer:
`Co-authored-by: Antigravity <antigravity@google.com>`

---

## 📊 Test Suite Report

Ran with **Vitest 2.1.8** and **Supertest** over persistent SQLite test databases.

```text
 ✓ tests/auth.test.ts (9 tests) 592ms
   ✓ POST /api/auth/register
     ✓ should register a new customer user and return 201 with user object (excluding password)
     ✓ should register an admin user when role is admin
     ✓ should return 400 if username or password is missing
     ✓ should return 400 if password is less than 6 characters
     ✓ should return 409 Conflict if username is already registered
   ✓ POST /api/auth/login
     ✓ should login successfully with valid credentials and return JWT token
     ✓ should return 401 when password is incorrect
     ✓ should return 401 when username does not exist
     ✓ should return 400 when missing username or password

 ✓ tests/vehicles.test.ts (11 tests) 2572ms
   ✓ Authentication and Authorization Middleware
     ✓ should reject requests without Authorization header (401)
     ✓ should reject requests with invalid token (401)
   ✓ POST /api/vehicles
     ✓ should create a vehicle with unique id and valid properties (201)
     ✓ should return 400 if required fields are missing
     ✓ should return 400 if price is negative or quantity is negative
   ✓ GET /api/vehicles
     ✓ should return all available vehicles
   ✓ PUT /api/vehicles/:id
     ✓ should update a vehicle details
     ✓ should return 404 for non-existent vehicle id
   ✓ DELETE /api/vehicles/:id (Admin only)
     ✓ should return 403 Forbidden when standard user attempts to delete a vehicle
     ✓ should allow admin to delete a vehicle (200)
     ✓ should return 404 if admin tries to delete a non-existent vehicle

 ✓ tests/search.test.ts (9 tests) 1176ms
   ✓ should require authentication token (401)
   ✓ should filter vehicles by make (case-insensitive)
   ✓ should filter vehicles by model (case-insensitive)
   ✓ should filter vehicles by category
   ✓ should filter vehicles within a price range (minPrice and maxPrice)
   ✓ should filter vehicles by minPrice only
   ✓ should combine multiple filters (e.g. category=Sedan and maxPrice=30000)
   ✓ should return empty list when no vehicles match query
   ✓ should support unified text search across make, model, or category

 ✓ tests/inventory.test.ts (9 tests) 2162ms
   ✓ POST /api/vehicles/:id/purchase
     ✓ should require authentication (401)
     ✓ should purchase a vehicle successfully and decrease quantity by 1 (200)
     ✓ should return 400 when attempting to purchase an out-of-stock vehicle
     ✓ should return 404 when attempting to purchase a non-existent vehicle
   ✓ POST /api/vehicles/:id/restock (Admin only)
     ✓ should require authentication (401)
     ✓ should return 403 Forbidden when standard user attempts to restock
     ✓ should allow admin to restock a vehicle and increase its quantity (200)
     ✓ should return 400 if restock quantity is missing, non-positive, or not an integer
     ✓ should return 404 if restock target does not exist

---------------------------------------------------------------------------------
Test Files  4 passed (4)
Tests       38 passed (38)
Pass Rate   100%
---------------------------------------------------------------------------------
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm`

### 1. Installation

Clone or open the repository directory:
```bash
cd car-dealership-inventory
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### 2. Running Tests
Run the entire backend test suite:
```bash
cd backend
npm test
```

### 3. Starting the Backend Server
```bash
cd backend
npm run dev
# or: npm run build && npm start
```
The backend starts on `http://localhost:5001`. The SQLite database file will automatically be created and seeded at `backend/data/dealership.sqlite`.

### 4. Starting the Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open your browser to `http://localhost:3000` (or `http://localhost:5173`).

---

## 🔑 Default Seed Credentials

For quick evaluation without manual signup, the following accounts and luxury fleet are seeded into the database:

| Role | Username | Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | View, Search, Purchase, Add Vehicle, Edit Vehicle, Restock, Delete |
| **Customer** | `customer` | `customer123` | View, Search, Purchase |

*(Tip: In the frontend navigation bar, you can also click the **"⚡ Admin"** or **"⚡ Customer"** buttons for 1-click instant login!)*

---

## 💻 Application Screenshots & UI Overview

```
+---------------------------------------------------------------------------------------+
|  [CAR ICON] APEX MOTORS  [INVENTORY]                    [Quick Demo: Admin | Customer]|
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   PRECISION AUTOMOTIVE FLEET                                                          |
|   Dealership Inventory System                                                         |
|   Real-time live fleet tracking, purchase workflows, and admin restocking.            |
|                                                                                       |
|   +------------------+  +------------------+  +------------------+  +---------------+ |
|   | Total Units: 30  |  | Fleet: $2.4M     |  | Categories: 6    |  | Sold Out: 1   | |
|   +------------------+  +------------------+  +------------------+  +---------------+ |
+---------------------------------------------------------------------------------------+
|   [ Search by make, model, or category... ]   [Make v]  [$ Min]  [$ Max]  [+ Add Car] |
|   Categories: [ All ] [ Sedan ] [ SUV ] [ Coupe ] [ Truck ] [ Wagon ] [ Electric ]    |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  +-------------------------+  +-------------------------+  +------------------------+ |
|  | ELECTRIC   [4 in stock] |  | COUPE      [2 in stock] |  | COUPE       [SOLD OUT] | |
|  | TESLA                   |  | PORSCHE                 |  | CHEVROLET              | |
|  | Model S Plaid           |  | 911 Carrera S           |  | Corvette Z06           | |
|  | MSRP: $89,990           |  | MSRP: $131,300          |  | MSRP: $112,700         | |
|  | [ Purchase Vehicle ]    |  | [ Purchase Vehicle ]    |  | [ Out of Stock (DIS) ] | |
|  | [Edit] [Restock] [Del]  |  | [Edit] [Restock] [Del]  |  | [Edit] [Restock] [Del] | |
|  +-------------------------+  +-------------------------+  +------------------------+ |
+---------------------------------------------------------------------------------------+
```

---

## 🤖 My AI Usage (Mandatory Section)

### 1. Which AI Tools Were Used
- **Antigravity (Google DeepMind)** with **Gemini 3.8 Flash / Thinking models**.

### 2. How the AI Tools Were Used
- **Test-Driven Development (TDD) Test Authoring**:
  - Outlined and authored comprehensive, failing test cases (Red phase) for authentication (`POST /api/auth/register`, `POST /api/auth/login`), vehicle CRUD, query search filtering, and inventory operations (`purchase` decrement and `restock` increment).
- **Architecture & SOLID Design**:
  - Designed a decoupled repository layer (`IDatabase`, `UserRepository`, `VehicleRepository`) that isolates SQL persistence from business validation services (`AuthService`, `VehicleService`, `InventoryService`).
- **Debugging & Resolution**:
  - Solved module resolution discrepancies with `node:sqlite` in Vite/Vitest by creating an abstraction bridge that resolved native SQLite bindings cleanly across both commonjs and ES module contexts.
  - Identified edge-case handling in Express controllers when parsing optional request bodies in purchase requests.
- **Frontend Architecture & UX Design**:
  - Built a reactive Tailwind CSS automotive UI with real-time stock status badges, interactive modals for adding/updating/restocking vehicles, and seamless 1-click evaluation buttons.

### 3. Reflection on AI Impact on Workflow
- **Speed & Verification**: Implementing a full-stack system with 38 test cases, strict RBAC, database migrations, and a polished frontend typically requires substantial boilerplate time. Leveraging AI allowed rapid iteration while maintaining clean test coverage and strict type safety.
- **TDD Rigor**: By writing tests first, AI helped catch logical oversights early (e.g. preventing negative prices or quantities, enforcing admin restrictions on deletes and restocks, and ensuring out-of-stock vehicles cannot be purchased).
- **Engineering Transparency**: Every commit was logged with clean commit narratives and explicit co-authorship metadata, demonstrating transparent, pair-programming-oriented AI collaboration.
