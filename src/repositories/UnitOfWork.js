const pool = require('../config/database');

/**
 * Unit of Work Pattern
 * Manages database transactions to ensure atomicity
 */
class UnitOfWork {
  constructor() {
    this.client = null;
  }

  async begin() {
    this.client = await pool.connect();
    await this.client.query('BEGIN');
    return this.client;
  }

  async commit() {
    if (!this.client) throw new Error('No active transaction');
    await this.client.query('COMMIT');
  }

  async rollback() {
    if (!this.client) return;
    await this.client.query('ROLLBACK');
  }

  async release() {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
  }

  /**
   * Execute a function within a transaction.
   * Automatically commits on success, rolls back on error.
   */
  static async transaction(fn) {
    const uow = new UnitOfWork();
    const client = await uow.begin();
    try {
      const result = await fn(client);
      await uow.commit();
      return result;
    } catch (err) {
      await uow.rollback();
      throw err;
    } finally {
      await uow.release();
    }
  }
}

module.exports = UnitOfWork;
