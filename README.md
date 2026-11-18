

React (Vite) frontend + Express REST API + MySQL.

```
library-app/
├── backend/   Express API, MySQL schema, setup script
└── frontend/  React app (Router, hooks, controlled forms, Fetch API)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     
npm run setup             
npm start                 # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Demo logins
| Role   | Membership ID | Password    |
|--------|---------------|-------------|
| Admin  | ADMIN001      | admin123    |
| Member | MEM1001       | member123   |

## Features
- **Dashboard** – availability as cards or table, search, low-stock highlighting (fewer than 2 copies), summary counts.
- **Books** (admin) – add form with validation, inline Update / Delete.
- **Transactions** – add stock (admin), borrow (deducts stock), return; stock never goes below 0; full history log.
- **Users** (admin) – add / update / delete users (name, membership ID, role); login form with signed-token auth.

## API
| Method | Route | Access |
|---|---|---|
| POST | /auth/login | public |
| GET / POST / PUT / DELETE | /books, /books/:id | read: any user, write: admin |
| GET / POST | /transactions | any user (add_stock: admin only) |
| GET | /users | any user |
| POST / PUT / DELETE | /users, /users/:id | admin |

Middleware: `express.json()`, `cors`, auth/admin guards, central error handler. Passwords hashed with scrypt; stock changes use a MySQL transaction with row locking (`SELECT … FOR UPDATE`).

