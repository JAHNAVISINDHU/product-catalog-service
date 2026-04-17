/**
 * Integration test database setup/teardown utilities.
 * Uses a real PostgreSQL connection.
 * Requires DB env vars to be set.
 */
const pool = require('../../config/database');

const setupTestDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      sku VARCHAR(100) UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_categories (
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, category_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_fts ON products
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')))
  `);
};

const cleanDb = async () => {
  await pool.query('DELETE FROM product_categories');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM categories');
};

const teardownTestDb = async () => {
  await pool.end();
};

module.exports = { setupTestDb, cleanDb, teardownTestDb };
