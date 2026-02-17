class BaseRepository {
  constructor(model, tableName) {
    this.model = model;
    this.tableName = tableName;
    this.db = require('../config/database');
  }

  async getById(id) {
    const res = await this.db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return res.rows[0] ? new this.model(res.rows[0]) : null;
  }

  async getAll(skip = 0, limit = 10) {
    const res = await this.db.query(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, skip]);
    return res.rows.map(row => new this.model(row));
  }

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i+1}`).join(', ');
    const values = Object.values(data);
    const res = await this.db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return new this.model(res.rows[0]);
  }

  async update(id, data) {
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i+1}`).join(', ');
    const values = [...Object.values(data), id];
    const res = await this.db.query(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values
    );
    return res.rows[0] ? new this.model(res.rows[0]) : null;
  }

  async delete(id) {
    const res = await this.db.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`, [id]);
    return res.rowCount > 0;
  }
}

module.exports = BaseRepository;
