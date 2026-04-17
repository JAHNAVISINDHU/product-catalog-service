# Product Catalog Service

A robust e-commerce backend microservice implementing the **Repository Pattern** and **Unit of Work** for clean data access, featuring an advanced search API and PostgreSQL integration.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/JAHNAVISINDHU/product-catalog-service)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

---

## 🚀 Overview

This service provides a scalable foundation for managing products and categories in an e-commerce ecosystem. By utilizing the Repository pattern and Unit of Work, the project ensures a strict separation of concerns, making the codebase highly testable and maintainable.

### Key Features
- **Advanced Search**: Filter by keywords, price ranges, and multiple category IDs.
- **Atomic Transactions**: Ensures data integrity using a custom Unit of Work implementation.
- **Validation**: Strict request validation using Joi.
- **Documentation**: Interactive API exploration via Swagger/OpenAPI.
- **Dockerized**: One-command setup for both the application and the database.

---

## 🛠 Tech Stack

- **Runtime**: Node.js 18 + Express.js
- **Database**: PostgreSQL 15
- **ORM/Querying**: Raw SQL via `pg` (node-postgres)
- **Validation**: Joi
- **API Docs**: OpenAPI 3.0 / Swagger UI
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

---

## 📂 Architecture

The project follows a layered architecture to decouple business logic from data access:

```text
src/
├── app.js                  # Express app entry point
├── swagger.yaml            # OpenAPI 3.0 specification
├── config/                 # DB Connections & Logging
├── repositories/           # Data access layer (SQL logic)
│   ├── BaseRepository.js   # Shared query abstraction
│   └── UnitOfWork.js       # Transaction manager
├── services/               # Business logic layer
├── controllers/            # HTTP request handlers
├── routes/                 # Express route definitions
├── middleware/             # Validation & Error handling
└── tests/                  # Unit and Integration tests
````

-----

## ⚡ Quick Start (Docker)

The fastest way to get the service running is using Docker. This will spin up the Node.js app and a PostgreSQL instance pre-loaded with seed data.

```bash
# 1. Clone the repository
git clone [https://github.com/JAHNAVISINDHU/product-catalog-service.git](https://github.com/JAHNAVISINDHU/product-catalog-service.git)
cd product-catalog-service

# 2. Start all services
docker-compose up --build
```

  - **API Base URL**: `http://localhost:3000`
  - **Swagger Docs**: `http://localhost:3000/api-docs`
  - **Health Check**: `http://localhost:3000/health`

> **Note**: The database is automatically seeded with 12 products and 3 categories on the first startup.

-----

## 💻 Local Development

If you prefer to run the application outside of Docker:

1.  **Start the database:**

    ```bash
    docker-compose up db -d
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment:**

    ```bash
    cp .env.example .env
    # Ensure DB_HOST is set to 'localhost' in your .env
    ```

4.  **Run the app:**

    ```bash
    npm run dev
    ```

-----

## 🧪 Running Tests

### Unit Tests

Tests the logic in isolation using mocked database connections.

```bash
npm run test:unit
```

### Integration Tests

Requires a running PostgreSQL instance.

```bash
# Start DB
docker-compose up db -d

# Run tests
INTEGRATION_TEST=true DB_HOST=localhost npm run test:integration
```

-----

## 🔗 API Reference

### Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | List products (paginated) |
| `POST` | `/products` | Create a product |
| `GET` | `/products/search` | Advanced search & filtering |
| `GET` | `/products/:id` | Get product details |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Remove a product |

### Advanced Search Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `keyword` | `string` | Search in name and description |
| `category_ids` | `string` | CSV format (e.g., `1,2,5`) |
| `min_price` | `number` | Minimum price threshold |
| `max_price` | `number` | Maximum price threshold |

-----

## 🏗 Design Patterns

### Repository Pattern

All database operations are abstracted behind repository classes. Controllers never touch the database directly; they interact with **Services**, which in turn utilize **Repositories**.

### Unit of Work

The `UnitOfWork.transaction(fn)` wrapper ensures that complex operations are atomic. If a multi-step process fails at any point, the entire transaction is rolled back automatically.

```javascript
// Example of Atomic Creation
return UnitOfWork.transaction(async (client) => {
  const product = await productRepo.create(productData, client);
  await productRepo.linkCategories(product.id, categoryIds, client);
  return productRepo.findById(product.id, client);
});
```

-----

**Developed by [Jahnavi Sindhu](https://www.google.com/search?q=https://github.com/JAHNAVISINDHU)**
