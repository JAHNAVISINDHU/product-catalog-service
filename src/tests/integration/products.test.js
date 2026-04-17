/**
 * Integration Tests: Products API
 * Requires a real PostgreSQL database.
 * Set INTEGRATION_TEST=true and DB env vars to run.
 */

const request = require('supertest');
const app = require('../../app');
const { setupTestDb, cleanDb, teardownTestDb } = require('./testDb');

const isIntegration = process.env.INTEGRATION_TEST === 'true';
const describeIf = isIntegration ? describe : describe.skip;

describeIf('Products API (integration)', () => {
  let categoryId;

  beforeAll(async () => {
    await setupTestDb();
    const catRes = await request(app).post('/categories').send({ name: 'Electronics', description: 'Gadgets' });
    categoryId = catRes.body.id;
  });

  afterEach(async () => {
    const pool = require('../../config/database');
    await pool.query('DELETE FROM product_categories');
    await pool.query('DELETE FROM products');
  });

  afterAll(async () => {
    await cleanDb();
    await teardownTestDb();
  });

  const baseProduct = () => ({
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 79.99,
    stock: 100,
    sku: `SKU-${Date.now()}`,
    category_ids: [categoryId],
  });

  describe('POST /products', () => {
    it('should create a product and return 201 with categories', async () => {
      const res = await request(app).post('/products').send(baseProduct());

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Wireless Headphones');
      expect(res.body.price).toBe(79.99);
      expect(res.body.categories).toHaveLength(1);
      expect(res.body.categories[0].id).toBe(categoryId);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/products').send({ description: 'No name or price' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for negative price', async () => {
      const res = await request(app).post('/products').send({ name: 'Bad Product', price: -5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid category_ids', async () => {
      const res = await request(app).post('/products').send({ ...baseProduct(), category_ids: [99999] });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate sku', async () => {
      const product = baseProduct();
      await request(app).post('/products').send(product);
      const res = await request(app).post('/products').send({ ...product, sku: product.sku });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /products/:id', () => {
    it('should retrieve a product by ID with categories', async () => {
      const created = await request(app).post('/products').send(baseProduct());
      const res = await request(app).get(`/products/${created.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
      expect(res.body.categories).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/products/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /products', () => {
    it('should return paginated products with total', async () => {
      await request(app).post('/products').send(baseProduct());
      await request(app).post('/products').send({ ...baseProduct(), sku: `SKU2-${Date.now()}`, name: 'Keyboard' });

      const res = await request(app).get('/products?limit=10&skip=0');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(2);
      expect(res.body.limit).toBe(10);
      expect(res.body.skip).toBe(0);
    });

    it('should respect limit and skip pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app).post('/products').send({ name: `Product ${i}`, price: 10 * (i + 1), sku: `P-${i}-${Date.now()}` });
      }
      const res = await request(app).get('/products?limit=2&skip=1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product name and price', async () => {
      const created = await request(app).post('/products').send(baseProduct());
      const res = await request(app)
        .put(`/products/${created.body.id}`)
        .send({ name: 'Updated Headphones', price: 99.99 });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Headphones');
      expect(res.body.price).toBe(99.99);
    });

    it('should update product categories', async () => {
      const created = await request(app).post('/products').send(baseProduct());
      const res = await request(app)
        .put(`/products/${created.body.id}`)
        .send({ category_ids: [] });

      expect(res.status).toBe(200);
      expect(res.body.categories).toHaveLength(0);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).put('/products/99999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product and return 204', async () => {
      const created = await request(app).post('/products').send(baseProduct());
      const res = await request(app).delete(`/products/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).delete('/products/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /products/search', () => {
    beforeEach(async () => {
      await request(app).post('/products').send({ name: 'Wireless Headphones', description: 'noise cancelling audio', price: 79.99, sku: `S1-${Date.now()}`, category_ids: [categoryId] });
      await request(app).post('/products').send({ name: 'Mechanical Keyboard', description: 'RGB backlit', price: 89.99, sku: `S2-${Date.now()}`, category_ids: [categoryId] });
      await request(app).post('/products').send({ name: 'USB Hub', description: 'multiport adapter', price: 29.99, sku: `S3-${Date.now()}` });
    });

    it('should filter by keyword', async () => {
      const res = await request(app).get('/products/search?keyword=headphones');
      expect(res.status).toBe(200);
      expect(res.body.data.some(p => p.name.toLowerCase().includes('headphones'))).toBe(true);
    });

    it('should filter by min_price', async () => {
      const res = await request(app).get('/products/search?min_price=80');
      expect(res.status).toBe(200);
      res.body.data.forEach(p => expect(p.price).toBeGreaterThanOrEqual(80));
    });

    it('should filter by max_price', async () => {
      const res = await request(app).get('/products/search?max_price=50');
      expect(res.status).toBe(200);
      res.body.data.forEach(p => expect(p.price).toBeLessThanOrEqual(50));
    });

    it('should filter by category_ids', async () => {
      const res = await request(app).get(`/products/search?category_ids=${categoryId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should combine filters', async () => {
      const res = await request(app).get(`/products/search?keyword=keyboard&min_price=50&max_price=100`);
      expect(res.status).toBe(200);
      expect(res.body.data.some(p => p.name.toLowerCase().includes('keyboard'))).toBe(true);
    });

    it('should return 400 for invalid min_price', async () => {
      const res = await request(app).get('/products/search?min_price=abc');
      expect(res.status).toBe(400);
    });
  });
});
