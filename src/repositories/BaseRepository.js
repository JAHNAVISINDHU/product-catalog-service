const pool = require('../config/database');

/**
 * Base Repository
 * Provides common database query methods
 */
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  /**
   * Execute a query using pool or a provided client (for transactions)
   */
  async query(sql, params = [], client = null) {
    const executor = client || this.pool;
    return executor.query(sql, params);
  }

  async findById(id, client = null) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
      client
    );
    return rows[0] || null;
  }

  async deleteById(id, client = null) {
    const { rowCount } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
      client
    );
    return rowCount > 0;
  }
}

module.exports = BaseRepository;
