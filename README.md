# Finance Data Processing and Access Control Backend

Backend API for a finance dashboard system with role-based access control, financial records management, analytics, and API documentation.

## Objective Mapping

This project addresses the assignment requirements:

1. User and role management
2. Financial records CRUD and filtering
3. Dashboard summary APIs
4. Access control by role
5. Validation and error handling
6. Persistent storage with PostgreSQL

Optional enhancements included:

1. JWT authentication
2. Pagination
3. Soft delete
4. Rate limiting
5. Unit/integration tests
6. OpenAPI + Scalar API docs

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- JWT + bcrypt
- express-validator
- Jest + Supertest
- Docker + Docker Compose
- OpenAPI 3.0 + Scalar

## Roles and Permissions

- Viewer
- Can view records and dashboard data
- Cannot create, update, delete records
- Cannot manage users

- Analyst
- Can view records and dashboard data
- Can create and update records
- Cannot delete records
- Cannot manage users

- Admin
- Full access to records and dashboard data
- Can delete records
- Can manage users (list users, update role, update status)

## API Modules

### Auth

- POST /auth/register
- POST /auth/login

### Users (Admin only)

- GET /users
- PATCH /users/:id/role
- PATCH /users/:id/status

### Records

- POST /records (admin, analyst)
- GET /records (admin, analyst, viewer)
- PATCH /records/:id (admin, analyst)
- DELETE /records/:id (admin)

Supports filters:

- type
- category
- notes
- from
- to
- page
- limit

### Dashboard

- GET /dashboard/summary
- GET /dashboard/by-category
- GET /dashboard/trends (monthly)
- GET /dashboard/recent

### Health

- GET /health
- GET /db-health

## API Documentation

- Scalar UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/spec.json

OpenAPI source file:

- docs/openapi.json

## Data Model

### users

- id (uuid)
- name
- email (unique)
- password_hash
- role (admin | analyst | viewer)
- status (active | inactive)
- created_at
- updated_at

### records

- id (uuid)
- user_id (fk -> users.id)
- amount (numeric, > 0)
- type (income | expense)
- category
- date
- notes
- deleted_at (soft delete)
- created_at
- updated_at

## Validation and Error Handling

Implemented with Zod schemas (via validation middleware) and standardized API responses.

Examples of error codes:

- TOKEN_MISSING
- TOKEN_INVALID
- FORBIDDEN
- EMAIL_TAKEN
- INVALID_CREDENTIALS
- ACCOUNT_INACTIVE
- RECORD_NOT_FOUND
- USER_NOT_FOUND
- DB_UNAVAILABLE

## Local Setup (Without Docker)

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables in .env:

```env
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=postgres
DB_PASSWORD=postgres

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000,https://zorvyn-task.abhinavgarg.in
```

3. Run migrations:

```bash
pnpm migrate
```

4. Start dev server:

```bash
pnpm dev
```

## Docker Setup

1. Start backend + database:

```bash
docker compose up --build -d
```

2. Verify health:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/db-health
```

## Testing

Run all tests:

```bash
pnpm test
```

Run integration tests only:

```bash
pnpm jest src/tests/integration.test.ts --runInBand --verbose
```

Note: integration tests use the host DB settings from .env. With docker compose, Postgres is exposed on host port 5433, so set DB_HOST=localhost and DB_PORT=5433 before running tests.

Run unit tests example:

```bash
pnpm jest src/modules/dashboard/dashboard.service.test.ts --runInBand
```

## Example Flow

1. Register user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"password123"}'
```

2. Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

3. Use returned token:

```bash
curl http://localhost:3000/dashboard/summary \
  -H "Authorization: Bearer <TOKEN>"
```

## Assumptions and Tradeoffs

- JWT auth is stateless with no token revocation list.
- Trends endpoint currently returns monthly aggregates.
- Rate limiter is applied globally.
- Soft delete is applied to records, not users.
- Designed for clarity and maintainability over advanced production concerns.

## Repository

- GitHub: https://github.com/ABHINAVGARG05/Zorvyn-Task
