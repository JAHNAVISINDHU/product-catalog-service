/**
 * Unit Tests: CategoryRepository
 * These tests mock the database pool entirely — no real DB connection needed.
 */

jest.mock('../../config/database', () => ({
  query: jest.fn(),
}));

const pool = require('../../config/database');
const CategoryRepository = require('../../repositories/CategoryRepository');

describe('CategoryRepository (unit)', () => {
  let repo;

  beforeEach(() => {
    repo = new CategoryRepository();
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should insert a category and return the created row', async () => {
      const mockRow = { id: 1, name: 'Electronics', description: 'Gadgets', created_at: new Date(), updated_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repo.create({ name: 'Electronics', description: 'Gadgets' });

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toMatch(/INSERT INTO categories/i);
      expect(result).toEqual(mockRow);
    });

    it('should pass null for description when not provided', async () => {
      const mockRow = { id: 2, name: 'Books', description: null, created_at: new Date(), updated_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      await repo.create({ name: 'Books' });

      const params = pool.query.mock.calls[0][1];
      expect(params[1]).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should return the category when found', async () => {
      const mockRow = { id: 1, name: 'Electronics', description: 'Gadgets' };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repo.findById(1);
      expect(result).toEqual(mockRow);
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
    });

    it('should return null when category not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const result = await repo.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return data and total', async () => {
      const mockRows = [
        { id: 1, name: 'Electronics', description: 'Gadgets' },
        { id: 2, name: 'Books', description: 'Reading material' },
      ];
      pool.query
        .mockResolvedValueOnce({ rows: mockRows })
        .mockResolvedValueOnce({ rows: [{ count: '2' }] });

      const result = await repo.findAll({ limit: 10, skip: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply default limit and skip', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      await repo.findAll();
      const params = pool.query.mock.calls[0][1];
      expect(params[0]).toBe(10); // default limit
      expect(params[1]).toBe(0);  // default skip
    });
  });

  describe('update()', () => {
    it('should build the correct UPDATE query with provided fields', async () => {
      const mockRow = { id: 1, name: 'Updated', description: 'New desc' };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repo.update(1, { name: 'Updated', description: 'New desc' });

      expect(pool.query.mock.calls[0][0]).toMatch(/UPDATE categories/i);
      expect(result).toEqual(mockRow);
    });

    it('should return null when updating a non-existent category', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const result = await repo.update(999, { name: 'Ghost' });
      expect(result).toBeNull();
    });
  });

  describe('deleteById()', () => {
    it('should return true when a row is deleted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });
      const result = await repo.deleteById(1);
      expect(result).toBe(true);
    });

    it('should return false when no rows are deleted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      const result = await repo.deleteById(999);
      expect(result).toBe(false);
    });
  });

  describe('findByIds()', () => {
    it('should return matching categories', async () => {
      const mockRows = [{ id: 1 }, { id: 2 }];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repo.findByIds([1, 2]);
      expect(result).toHaveLength(2);
      expect(pool.query.mock.calls[0][1]).toEqual([[1, 2]]);
    });

    it('should return empty array for empty ids', async () => {
      const result = await repo.findByIds([]);
      expect(result).toEqual([]);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
});
