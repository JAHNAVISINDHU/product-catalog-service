/**
 * Integration Tests: Categories API
 * Requires a real PostgreSQL database.
 * Set env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

const request = require('supertest');
const app = require('../../app');
const { setupTestDb, cleanDb, teardownTestDb } = require('./testDb');

const isIntegration = process.env.INTEGRATION_TEST === 'true';

const describeIf = isIntegration ? describe : describe.skip;

describeIf('Categories API (integration)', () => {
  beforeAll(async () => { await setupTestDb(); });
  afterEach(async () => { await cleanDb(); });
  afterAll(async () => { await teardownTestDb(); });

  describe('POST /categories', () => {
    it('should create a category and return 201', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Electronics', description: 'Electronic gadgets' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Electronics');
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app).post('/categories').send({ description: 'No name' });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate category name', async () => {
      await request(app).post('/categories').send({ name: 'Electronics' });
      const res = await request(app).post('/categories').send({ name: 'Electronics' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a category by ID', async () => {
      const created = await request(app).post('/categories').send({ name: 'Books' });
      const res = await request(app).get(`/categories/${created.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Books');
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).get('/categories/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /categories', () => {
    it('should return paginated categories', async () => {
      await request(app).post('/categories').send({ name: 'Cat A' });
      await request(app).post('/categories').send({ name: 'Cat B' });

      const res = await request(app).get('/categories?limit=10&skip=0');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.total).toBeDefined();
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update a category and return 200', async () => {
      const created = await request(app).post('/categories').send({ name: 'Old Name' });
      const res = await request(app).put(`/categories/${created.body.id}`).send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    it('should return 404 when updating non-existent category', async () => {
      const res = await request(app).put('/categories/99999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for empty body', async () => {
      const created = await request(app).post('/categories').send({ name: 'Test' });
      const res = await request(app).put(`/categories/${created.body.id}`).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category and return 204', async () => {
      const created = await request(app).post('/categories').send({ name: 'To Delete' });
      const res = await request(app).delete(`/categories/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent category', async () => {
      const res = await request(app).delete('/categories/99999');
      expect(res.status).toBe(404);
    });
  });
});
