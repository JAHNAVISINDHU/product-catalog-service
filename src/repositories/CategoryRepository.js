const BaseRepository = require('./BaseRepository');

class CategoryRepository extends BaseRepository {
  constructor() {
    super('categories');
  }

  async create({ name, description }, client = null) {
    const { rows } = await this.query(
      `INSERT INTO categories (name, description, updated_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [name, description || null],
      client
    );
    return rows[0];
  }

  async findAll({ limit = 10, skip = 0 } = {}, client = null) {
    const { rows } = await this.query(
      `SELECT * FROM categories ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, skip],
      client
    );
    const { rows: countRows } = await this.query(
      `SELECT COUNT(*) FROM categories`,
      [],
      client
    );
    return { data: rows, total: parseInt(countRows[0].count) };
  }

  async update(id, { name, description }, client = null) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }

    if (fields.length === 0) return this.findById(id, client);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
      client
    );
    return rows[0] || null;
  }

  async findByIds(ids, client = null) {
    if (!ids || ids.length === 0) return [];
    const { rows } = await this.query(
      `SELECT * FROM categories WHERE id = ANY($1::int[])`,
      [ids],
      client
    );
    return rows;
  }
}

module.exports = CategoryRepository;
