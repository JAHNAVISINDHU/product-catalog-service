# Product Catalog Service

A robust e-commerce backend microservice implementing the **Repository Pattern** and **Unit of Work** for clean data access, with an advanced search API.

## Tech Stack

- **Runtime**: Node.js 18 + Express.js
- **Database**: PostgreSQL 15
- **ORM**: Raw SQL via `pg` (node-postgres)
- **Validation**: Joi
- **API Docs**: OpenAPI 3.0 / Swagger UI
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

---

## Architecture

```
src/
├── app.js                          # Express app entry point
├── swagger.yaml                    # OpenAPI 3.0 specification
├── config/
│   ├── database.js                 # PostgreSQL connection pool
│   └── logger.js                   # Winston logger
├── repositories/
│   ├── BaseRepository.js           # Shared query abstraction
│   ├── ProductRepository.js        # Product data access layer
│   ├── CategoryRepository.js       # Category data access layer
│   └── UnitOfWork.js               # Transaction manager
├── services/
│   ├── ProductService.js           # Product business logic
│   └── CategoryService.js          # Category business logic
├── controllers/
│   ├── productController.js        # HTTP request handlers
│   └── categoryController.js
├── routes/
│   ├── productRoutes.js
│   └── categoryRoutes.js
├── middleware/
│   ├── validate.js                 # Joi request validation
│   └── errorHandler.js             # Global error handling
└── tests/
    ├── unit/                       # Mocked DB, no real connection
    │   ├── productRepository.test.js
    │   ├── categoryRepository.test.js
    │   └── unitOfWork.test.js
    └── integration/                # Requires real PostgreSQL
        ├── testDb.js
        ├── products.test.js
        └── categories.test.js
```

---

## Quick Start (Docker)

```bash
# Clone and navigate
git clone <repo>
cd product-catalog-service

# Start all services (app + PostgreSQL with seed data)
docker-compose up --build

# App:       http://localhost:3000
# Swagger:   http://localhost:3000/api-docs
# Health:    http://localhost:3000/health
```

The database is **automatically seeded** with 12 products and 3 categories on first startup.

---

## Local Development

```bash
# 1. Start only the database
docker-compose up db -d

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
# Edit .env: set DB_HOST=localhost

# 4. Run the app
npm run dev
```

---

## Running Tests

### Unit Tests (no DB required)

```bash
npm run test:unit
```

### Integration Tests (requires PostgreSQL)

```bash
# Start the database first
docker-compose up db -d

# Run integration tests
INTEGRATION_TEST=true DB_HOST=localhost npm run test:integration
```

### All Tests

```bash
npm test
```

---

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List products (paginated) |
| `GET` | `/products/:id` | Get a single product |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `GET` | `/products/search` | Advanced search |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/categories` | Create a category |
| `GET` | `/categories` | List categories (paginated) |
| `GET` | `/categories/:id` | Get a single category |
| `PUT` | `/categories/:id` | Update a category |
| `DELETE` | `/categories/:id` | Delete a category |

### Search Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `keyword` | string | Full-text search on name + description |
| `category_ids` | string | Comma-separated category IDs e.g. `1,2` |
| `min_price` | number | Minimum price filter |
| `max_price` | number | Maximum price filter |
| `limit` | integer | Results per page (default: 10, max: 100) |
| `skip` | integer | Results to skip (default: 0) |

### Pagination Response Format

```json
{
  "data": [...],
  "total": 42,
  "limit": 10,
  "skip": 0
}
```

---

## Design Patterns

### Repository Pattern
All database operations are abstracted behind repository classes (`ProductRepository`, `CategoryRepository`). Controllers never touch the database directly — they go through Services → Repositories.

### Unit of Work
`UnitOfWork.transaction(fn)` wraps multi-step operations (e.g., creating a product AND linking its categories) in a single atomic PostgreSQL transaction. On success it commits; on failure it rolls back automatically.

### Example: Atomic Product Creation

```js
return UnitOfWork.transaction(async (client) => {
  const product = await productRepo.create(productData, client);   // Step 1
  await productRepo.linkCategories(product.id, categoryIds, client); // Step 2
  return productRepo.findById(product.id, client);                 // Step 3
});
// If any step fails → automatic ROLLBACK
```

---

## Error Responses

All errors return consistent JSON:

```json
{
  "error": "Not Found",
  "message": "Product with id 99 not found"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error / bad input |
| 404 | Resource not found |
| 409 | Conflict (duplicate SKU or name) |
| 500 | Unexpected server error |
