# PetCarePlus

## Stack

- **Backend**: ASP.NET Core (.NET 9), EF Core (MySQL), ASP.NET Identity + JWT
- **Frontend**: React + TypeScript + Vite + Tailwind
- **DB**: MySQL 8

## Architecture (Backend)

Modular monolith with 4 projects:

- **PetCare.Api** → API controllers, middleware, DI bootstrap
- **PetCare.Application** → use-cases (commands/queries), DTOs, validation
- **PetCare.Domain** → entities, enums, core rules (no EF)
- **PetCare.Infrastructure** → EF Core (DbContext + Migrations), Identity, JWT

## Features Implemented

### Authentication & Roles

- Pet Owner self-registration → `POST /api/auth/register-owner`
- Login for all roles → returns JWT (role claim included) → FE stores token in `localStorage`
- **Who am I** for FE routing → `GET /api/auth/me` (returns user + roles)
- Profile update for logged-in users → `PUT /api/users/me`
- Role-based authorization: **Owner**, **Vet**, **Admin**

### Admin – Vets Management

- **Create Vet** (Admin only)

  - API: `POST /api/admin/users/vets`
  - FE page: `/admin/vets/new` (form with validation + error handling)

- **List Vets** (Admin only)

  - API: `GET /api/admin/users/vets?search=&page=&pageSize=`
  - Server-side paging + case-insensitive search (name/email)
  - FE page: `/admin/vets` with table, loading/error/empty states, pagination, and 300ms debounced search

- **Vet Details** (Admin only)

  - API: `GET /api/admin/users/vets/{id}`
  - FE page: `/admin/vets/:id`, navigable from the list

- FE Admin area protected with `RequireAdmin` (client-side guard; backend still authoritative)

### Frontend Auth Flow

- Connected **Login** & **Registration** to backend
- JWT saved to `localStorage` (`APP_AT`)
- Role fetched from backend (`/api/auth/me`) and **routed accordingly**:

  - `ADMIN` → `/admin`
  - `VET` → `/vet`
  - default/`OWNER` → `/owner`

## Prereqs

- .NET SDK 9
- Node.js 20+
- MySQL 8

## Run (dev)

```bash
# API
cd backend/src/PetCare.Api
ASPNETCORE_URLS=http://localhost:5002 dotnet run
# Swagger: http://localhost:5002/swagger

# Web
cd frontend
cp .env.example .env
# set VITE_API_BASE_URL=http://localhost:5002
npm install
npm run dev
# http://localhost:5173
```

## Default Accounts (Dev)

- **Admin**

  - Email: `admin@petcare.com`
  - Password: `AdminPass123`

- Create Owners via `POST /api/auth/register-owner`

- Create Vets via `POST /api/admin/users/vets` (Admin token required)

## Key Endpoints

| Area       | Method | Path                         | Notes                                       |
| ---------- | ------ | ---------------------------- | ------------------------------------------- |
| Auth       | POST   | `/api/auth/register-owner`   | Owner self-registration                     |
| Auth       | POST   | `/api/auth/login`            | Returns JWT (bearer)                        |
| Auth       | GET    | `/api/auth/me`               | Current user + roles (for FE routing)       |
| Users      | PUT    | `/api/users/me`              | Update own profile                          |
| Admin/Vets | POST   | `/api/admin/users/vets`      | Create Vet (Admin only)                     |
| Admin/Vets | GET    | `/api/admin/users/vets`      | List Vets with `search`, `page`, `pageSize` |
| Admin/Vets | GET    | `/api/admin/users/vets/{id}` | Vet details by id                           |

## Frontend Routes

| Route             | Guard          | Purpose                          |
| ----------------- | -------------- | -------------------------------- |
| `/login`          | —              | Login form (calls `/auth/login`) |
| `/register`       | —              | Owner self-registration          |
| `/owner`          | (optional)     | Owner area (placeholder page)    |
| `/vet`            | (optional)     | Vet area (placeholder page)      |
| `/admin`          | `RequireAdmin` | Admin dashboard (existing)       |
| `/admin/vets`     | `RequireAdmin` | Vets list (paging + search)      |
| `/admin/vets/new` | `RequireAdmin` | Create Vet form                  |
| `/admin/vets/:id` | `RequireAdmin` | Vet details                      |

## Env Vars (Frontend)

Create `.env` in `frontend/`:

```
VITE_API_BASE_URL=http://localhost:5002
```

## Quick cURL Smoke Tests

**Login (get token)**

```bash
curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petcare.com","password":"AdminPass123"}'
```

**List vets**

```bash
curl -i "http://localhost:5002/api/admin/users/vets?page=1&pageSize=10&search=jane" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Create vet**

```bash
curl -i -X POST http://localhost:5002/api/admin/users/vets \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Dr. Jane Vet","email":"jane.vet@example.com","password":"Passw0rd1"}'
```

**Vet details**

```bash
curl -i "http://localhost:5002/api/admin/users/vets/<VET_ID>" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```
