
<!-- only and admin can create a user  -->


<!-- in production lead actor has to run the bellow command to first get their login details  -->

<!-- the login details can now the used to login where the user will be asked to change the password to their prefered choice  -->

<!-- first manager i created -->
<!-- set ALLOW_PROD_SEED=true -->


  



## Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Copy `.env.example` to `.env` and fill in your own values:
   \`\`\`
   MONGO_URI=           # your MongoDB connection string (Atlas or local)
   PORT=3400
   CLOUD_API_KEY=        # Cloudinary credentials, for product image uploads
   CLOUD_API_SECRET=
   CLOUD_NAME=
   JWT_SECRET=           # any long random string
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   \`\`\`
4. Seed the first Admin account:
   \`\`\`
   npm run seed:admin
   <!-- this only works for deployment -->
   \`\`\`
   This creates a default admin account:
   - Email: `admin@admin.local`
   - Password: `admin`
   - `mustChangePassword` is set to `true` — log in and immediately change the password via `PATCH /api/v1/users/me/password`.

   **In production** (`NODE_ENV=production`), the seed script refuses to run by default, and generates a random password instead of the default one. To seed intentionally in production:
   \`\`\`
   ALLOW_PROD_SEED=true npm run seed:admin
   \`\`\`
   (On Windows Command Prompt: `set ALLOW_PROD_SEED=true` then `npm run seed:admin` as a separate command.)

   (on powershell prompt: `$env:ALLOW_PROD_SEED="true"; npm run seed:admin`)

5. Start the server:
   \`\`\`
   npm run dev     # development, with nodemon
   npm start       # production
   \`\`\`

   ## API Reference

Base URL: `/api/v1`

### Auth

| Method | Endpoint      | Access | Description         |
| ------ | ------------- | ------ | ------------------- |
| POST   | `/auth/login` | Public | Log in, receive JWT |

### Users

| Method | Endpoint                | Access             | Description                                   |
| ------ | ----------------------- | ------------------ | --------------------------------------------- |
| POST   | `/users`                | Admin              | Create a new user (Admin/Manager/Storekeeper) |
| PATCH  | `/users/me`             | Any logged-in user | Update own name/email                         |
| PATCH  | `/users/me/password`    | Any logged-in user | Change own password                           |
| PATCH  | `/users/:id/deactivate` | Admin              | Deactivate a user                             |
| PATCH  | `/users/:id/reactivate` | Admin              | Reactivate a user                             |
| DELETE | `/users/:id`            | Admin              | Permanently delete a user                     |

### Warehouses

| Method | Endpoint                     | Access             | Description                                                   |
| ------ | ---------------------------- | ------------------ | ------------------------------------------------------------- |
| POST   | `/warehouses`                | Admin, Manager     | Create a warehouse                                            |
| GET    | `/warehouses`                | Any logged-in user | List warehouses (`?includeInactive=true` to include inactive) |
| GET    | `/warehouses/:id`            | Any logged-in user | Get a single warehouse                                        |
| PATCH  | `/warehouses/:id`            | Admin, Manager     | Update a warehouse                                            |
| PATCH  | `/warehouses/:id/deactivate` | Admin, Manager     | Deactivate                                                    |
| PATCH  | `/warehouses/:id/reactivate` | Admin, Manager     | Reactivate                                                    |
| DELETE | `/warehouses/:id`            | Admin              | Permanently delete                                            |

### Categories

Same shape as Warehouses — `/categories`, Admin+Manager for writes, Admin-only delete.

### Suppliers

Same shape as Warehouses — `/suppliers`, Admin+Manager for writes, Admin-only delete.

### Products

| Method | Endpoint                        | Access                      | Description                                         |
| ------ | ------------------------------- | --------------------------- | --------------------------------------------------- |
| POST   | `/products`                     | Admin, Manager, Storekeeper | Create a product (supports image upload, multipart) |
| GET    | `/products`                     | Any logged-in user          | List products (`?includeUnavailable=true`)          |
| GET    | `/products/:id`                 | Any logged-in user          | Get a single product                                |
| PATCH  | `/products/:id`                 | Admin, Manager, Storekeeper | Update a product (appends new images)               |
| PATCH  | `/products/:id/deactivate`      | Admin, Manager, Storekeeper | Mark unavailable                                    |
| PATCH  | `/products/:id/reactivate`      | Admin, Manager, Storekeeper | Mark available                                      |
| DELETE | `/products/:id`                 | Admin                       | Permanently delete                                  |
| DELETE | `/products/:id/images/:imageId` | Admin, Manager, Storekeeper | Delete one product image                            |

### Purchases

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/purchases` | Admin, Manager, Storekeeper | Create a draft purchase |
| GET | `/purchases` | Any logged-in user | List purchases |
| GET | `/purchases/:id` | Any logged-in user | Get a purchase with its line items |
| POST | `/purchases/:id/items` | Admin, Manager, Storekeeper | Add a line item (draft only) |
| PATCH | `/purchases/:id/confirm` | Admin, Manager, Storekeeper | Confirm — atomically updates stock, sets Product.costPrice |
| PATCH | `/purchases/:id/cancel` | Admin, Manager, Storekeeper | Cancel a draft purchase |

### Sales

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sales` | Admin, Manager, Storekeeper | Create a draft sale |
| GET | `/sales` | Any logged-in user | List sales |
| GET | `/sales/:id` | Any logged-in user | Get a sale with its line items |
| POST | `/sales/:id/items` | Admin, Manager, Storekeeper | Add a line item (draft only) |
| PATCH | `/sales/:id/confirm` | Admin, Manager, Storekeeper | Confirm — atomically decrements stock (rejects if insufficient) |
| PATCH | `/sales/:id/cancel` | Admin, Manager, Storekeeper | Cancel a draft sale |

### Stock

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stocks` | Any logged-in user | Current stock levels (`?product=`, `?warehouse=` filters) |
| GET | `/stocks/low` | Any logged-in user | Products at or below reorder threshold |
| POST | `/stocks/adjust` | Admin, Manager | Create a stock adjustment (damage, loss, recount) |
| GET | `/stocks/adjustment` | Any logged-in user | List stock adjustments |
| GET | `/stocks/adjustment/:id` | Any logged-in user | Get a single adjustment |
| POST | `/stocks/transfer` | Admin, Manager | Transfer stock between warehouses |

### Reports

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stocks/valuation` | Any logged-in user | Total inventory value (`?warehouse=` filter) |
| GET | `/stokas/movements` | Any logged-in user | Movement history (`?product=`, `?warehouse=`, `?type=`, `?startDate=`, `?endDate=`) |
| GET | `/stocks/movement-summary` | Any logged-in user | Fastest/slowest movers by quantity sold (`?startDate=`, `?endDate=`) |