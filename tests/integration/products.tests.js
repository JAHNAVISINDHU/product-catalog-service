const request = require('supertest');
const app = require('../../src/app');

describe('Products API', () => {
  it('POST /api/products should create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 10.99, sku: 'TEST001' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/products/search should work', async () => {
    const res = await request(app).get('/api/products/search?q=test');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
