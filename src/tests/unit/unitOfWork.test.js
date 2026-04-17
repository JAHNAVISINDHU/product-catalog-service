/**
 * Unit Tests: UnitOfWork
 * Verifies transaction lifecycle: begin, commit, rollback, release.
 */

jest.mock('../../config/database', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    connect: jest.fn().mockResolvedValue(mockClient),
    _mockClient: mockClient,
  };
});

const pool = require('../../config/database');
const UnitOfWork = require('../../repositories/UnitOfWork');

describe('UnitOfWork (unit)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = pool._mockClient;
    jest.clearAllMocks();
    mockClient.query.mockResolvedValue({});
  });

  describe('begin()', () => {
    it('should acquire a client and begin a transaction', async () => {
      const uow = new UnitOfWork();
      await uow.begin();

      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    });
  });

  describe('commit()', () => {
    it('should commit the transaction', async () => {
      const uow = new UnitOfWork();
      await uow.begin();
      await uow.commit();

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw if there is no active transaction', async () => {
      const uow = new UnitOfWork();
      await expect(uow.commit()).rejects.toThrow('No active transaction');
    });
  });

  describe('rollback()', () => {
    it('should rollback the transaction', async () => {
      const uow = new UnitOfWork();
      await uow.begin();
      await uow.rollback();

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should do nothing if client is null', async () => {
      const uow = new UnitOfWork();
      await expect(uow.rollback()).resolves.toBeUndefined();
    });
  });

  describe('release()', () => {
    it('should release the client and set it to null', async () => {
      const uow = new UnitOfWork();
      await uow.begin();
      await uow.release();

      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(uow.client).toBeNull();
    });
  });

  describe('transaction() static method', () => {
    it('should commit on successful function execution', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const result = await UnitOfWork.transaction(fn);

      expect(fn).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.query).not.toHaveBeenCalledWith('ROLLBACK');
      expect(result).toBe('result');
    });

    it('should rollback and rethrow when function throws', async () => {
      const err = new Error('DB failure');
      const fn = jest.fn().mockRejectedValue(err);

      await expect(UnitOfWork.transaction(fn)).rejects.toThrow('DB failure');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('should always release the client after success', async () => {
      await UnitOfWork.transaction(jest.fn().mockResolvedValue(null));
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should always release the client after failure', async () => {
      await expect(UnitOfWork.transaction(jest.fn().mockRejectedValue(new Error('fail')))).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });
});
