# Inventory Management System API

A RESTful API for tracking products, stock levels, and stock movements across
multiple warehouses — a single source of truth for a web dashboard, POS
system, or mobile app.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, bcrypt password hashing
- Multer + Cloudinary for image uploads

## Core Design Decision: Immutable Stock Ledger

Stock levels are never edited directly. Every stock-in (purchase), stock-out
(sale), transfer, or correction (adjustment) writes an immutable
`StockMovement` record. `StockLevel.currentQuantity` only ever changes as a
side effect of a movement being recorded — never overwritten directly. This
gives a full, trustworthy audit trail instead of a single editable number.

Purchases and Sales follow a `draft → confirmed → cancelled` workflow — stock
only moves once a document is confirmed, and confirmation is wrapped in a
MongoDB transaction so a partial failure can never leave stock in a corrupted
state.

## Roles

| Role | Access |
|---|---|
| Admin | Full access, including user management and hard deletes |
| Manager | Warehouse, Supplier, Category, Product, Stock Adjustment/Transfer management |
| Storekeeper | Product management, Purchases, Sales |

## Features

- **Auth** — JWT login, role-based access control, admin-only user creation, seeded first admin (forced password change on first login)
- **Product catalog** — Products (multi-image upload via Cloudinary), Categories, Warehouses, Suppliers — all with soft delete (deactivate/reactivate) and admin-only hard delete
- **Purchases** — draft → add line items → confirm (atomically increases stock, updates product cost price) → cancel
- **Sales** — draft → add line items → confirm (atomically decreases stock, blocks overselling) → cancel
- **Stock Adjustments** — direct corrections for damage/loss/recount, blocked from taking stock negative
- **Stock Transfers** — move stock between warehouses atomically, two-sided ledger entry
- **Low-stock alerts** — flags products below their reorder threshold
- **Reporting** — stock valuation, movement history, [fastest/slowest movers — if finished]

## API Overview

Base URL: `/api/v1`

| Resource | Routes |
|---|---|
| Auth | `POST /auth/login` |
| Users | `GET/POST /users`, `PATCH /users/me`, `PATCH /users/me/password` |
| Products | Full CRUD + deactivate/reactivate/delete + image upload |
| Warehouses / Categories / Suppliers | Full CRUD + deactivate/reactivate/delete |
| Purchases | `POST /purchases`, `POST /purchases/:id/items`, `PATCH /purchases/:id/confirm`, `PATCH /purchases/:id/cancel` |
| Sales | Same shape as Purchases |
| Stock | `GET /stock/level`, `GET /stock/low`, `POST /stock/adjust`, `POST /stock/transfer` |
| Reports | `GET /reports/valuation`, `GET /reports/movements` |

## Getting Started
```bash
npm install
cp .env.example .env   # fill in your values
npm run seed:admin     # creates the first admin account
npm run dev
```