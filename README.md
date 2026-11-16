# Car Dealership Inventory System

A full-stack inventory app for a car dealership, built test-first as a TDD kata. Customers can browse, search and buy vehicles. Admins also manage the catalogue and restock inventory.

**Stack:** Node.js · TypeScript · Express · SQLite (`node:sqlite`, WAL mode) · JWT + bcrypt · React 18 · Vite · Tailwind CSS · Vitest + Supertest

## Highlights

- **Test-driven:** each feature started with a failing test commit, then the implementation, then a refactor. The commit history shows that order. 38 integration tests across auth, vehicle CRUD, search and inventory, all passing.
- **Layered backend:** routes → controllers → services → repositories. The repositories depend on an `IDatabase` interface rather than SQLite directly, so business rules (no negative prices or quantities, no purchases when out of stock) live in services and are tested through the HTTP layer.
- **Auth and roles:** JWT authentication with bcrypt-hashed passwords. Deleting and restocking vehicles are admin-only (403 for customers).
- **Search:** filter by make, model, category and price range, or use a free-text keyword.
- **Inventory:** purchasing decrements stock, and the server rejects purchases at zero stock (400). The UI disables the button too.
- **Persistent storage:** file-backed SQLite with write-ahead logging, seeded with demo data on first run.

## API

All `/api/vehicles` routes require a bearer token.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/vehicles` | Authenticated |
| GET | `/api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=&search=` | Authenticated |
| GET | `/api/vehicles/:id` | Authenticated |
| POST | `/api/vehicles` | Authenticated |
| PUT | `/api/vehicles/:id` | Authenticated |
| DELETE | `/api/vehicles/:id` | Admin |
| POST | `/api/vehicles/:id/purchase` | Authenticated |
| POST | `/api/vehicles/:id/restock` | Admin |

## Project structure

```
backend/
  src/
    routes/  controllers/  services/  repositories/
    middleware/   # JWT verification, admin guard
    db/           # SQLite connection + seeder
    types/        # IDatabase contract
  tests/          # auth, vehicles, search, inventory
frontend/
  src/
    components/   # catalogue cards, filter bar, add/edit/restock/delete modals
    context/      # auth state
    services/     # typed API client
```

## Running locally

Requires Node.js 22+ for the built-in `node:sqlite` module.

```bash
cd backend && npm install && npm run dev      # http://localhost:5001
cd frontend && npm install && npm run dev     # http://localhost:3000, proxies /api to the backend
cd backend && npm test                        # run the test suite
```

Seeded accounts: `admin` / `admin123` and `customer` / `customer123`.

## AI usage

I used AI assistance for this kata, as the brief required. The raw prompt logs are in [`PROMPTS.md`](PROMPTS.md). I used it mainly to draft test cases for the red phase, to scaffold the repository and service layers, and to work through a `node:sqlite` module-resolution issue under Vitest.
