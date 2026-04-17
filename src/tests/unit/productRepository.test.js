/**
 * Unit Tests: ProductRepository
 * Database pool is fully mocked — no real DB connection.
 */

jest.mock('../../config/database', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/database');
const ProductRepository = require('../../repositories/ProductRepository');

describe('ProductRepository (unit)', () => {
  let repo;

  beforeEach(() => {
    repo = new ProductRepository();
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should insert a product and return the created row', async () => {
      const mockRow = { id: 1, name: 'Headphones', description: 'Great sound', price: '79.99', stock: 100, sku: 'ELEC-001' };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repo.create({ name: 'Headphones', description: 'Great sound', price: 79.99, stock: 100, sku: 'ELEC-001' });

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toMatch(/INSERT INTO products/i);
      expect(result).toEqual(mockRow);
    });
  });

  describe('findById()', () => {
    it('should return a product with its categories', async () => {
      const mockRows = [
        { id: 1, name: 'Headphones', description: 'Sound', price: '79.99', stock: 10, sku: 'ELEC-001', created_at: new Date(), updated_at: new Date(), category_id: 1, category_name: 'Electronics', category_description: 'Gadgets' },
        { id: 1, name: 'Headphones', description: 'Sound', price: '79.99', stock: 10, sku: 'ELEC-001', created_at: new Date(), updated_at: new Date(), category_id: 2, category_name: 'Audio', category_description: 'Sound devices' },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
      expect(result.categories).toHaveLength(2);
      expect(result.price).toBe(79.99);
    });

    it('should return null if product not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const result = await repo.findById(999);
      expect(result).toBeNull();
    });

    it('should return product with empty categories when none linked', async () => {
      const mockRows = [
        { id: 1, name: 'Headphones', description: 'Sound', price: '79.99', stock: 10, sku: 'ELEC-001', created_at: new Date(), updated_at: new Date(), category_id: null, category_name: null, category_description: null },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repo.findById(1);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('linkCategories()', () => {
    it('should execute insert for each category id', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      await repo.linkCategories(1, [2, 3]);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toMatch(/INSERT INTO product_categories/i);
    });

    it('should skip query when category ids array is empty', async () => {
      await repo.linkCategories(1, []);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('unlinkAllCategories()', () => {
    it('should delete all category links for a product', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 2 });
      await repo.unlinkAllCategories(1);

      expect(pool.query.mock.calls[0][0]).toMatch(/DELETE FROM product_categories/i);
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
    });
  });

  describe('update()', () => {
    it('should build the correct UPDATE query', async () => {
      const mockRow = { id: 1, name: 'Updated Headphones', price: '89.99' };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repo.update(1, { name: 'Updated Headphones', price: 89.99 });
      expect(pool.query.mock.calls[0][0]).toMatch(/UPDATE products/i);
      expect(result).toEqual(mockRow);
    });

    it('should return null when updating non-existent product', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const result = await repo.update(999, { name: 'Ghost' });
      expect(result).toBeNull();
    });
  });

  describe('deleteById()', () => {
    it('should return true when product is deleted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });
      expect(await repo.deleteById(1)).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      expect(await repo.deleteById(999)).toBe(false);
    });
  });

  describe('search()', () => {
    it('should return matching products and total', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Headphones', description: 'Sound', price: '79.99', stock: 10, sku: 'ELEC-001', created_at: new Date(), updated_at: new Date(), category_id: 1, category_name: 'Electronics', category_description: 'Gadgets' }] });

      const result = await repo.search({ keyword: 'headphones' });
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should add price filters to the query when provided', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await repo.search({ minPrice: 10, maxPrice: 100 });
      const countSql = pool.query.mock.calls[0][0];
      expect(countSql).toMatch(/price >= \$1/);
      expect(countSql).toMatch(/price <= \$2/);
    });

    it('should filter by category ids', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await repo.search({ categoryIds: [1, 2] });
      const countSql = pool.query.mock.calls[0][0];
      expect(countSql).toMatch(/product_categories/);
    });
  });
});
