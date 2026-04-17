const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  _buildProductWithCategories(rows) {
    if (!rows || rows.length === 0) return null;
    const product = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      price: parseFloat(rows[0].price),
      stock: rows[0].stock,
      sku: rows[0].sku,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      categories: rows
        .filter(r => r.category_id)
        .map(r => ({ id: r.category_id, name: r.category_name, description: r.category_description })),
    };
    return product;
  }

  async create({ name, description, price, stock, sku }, client = null) {
    const { rows } = await this.query(
      `INSERT INTO products (name, description, price, stock, sku, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, description || null, price, stock || 0, sku || null],
      client
    );
    return rows[0];
  }

  async linkCategories(productId, categoryIds, client = null) {
    if (!categoryIds || categoryIds.length === 0) return;
    const values = categoryIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await this.query(
      `INSERT INTO product_categories (product_id, category_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [productId, ...categoryIds],
      client
    );
  }

  async unlinkAllCategories(productId, client = null) {
    await this.query(
      `DELETE FROM product_categories WHERE product_id = $1`,
      [productId],
      client
    );
  }

  async findById(id, client = null) {
    const { rows } = await this.query(
      `SELECT p.*,
              c.id AS category_id,
              c.name AS category_name,
              c.description AS category_description
       FROM products p
       LEFT JOIN product_categories pc ON p.id = pc.product_id
       LEFT JOIN categories c ON pc.category_id = c.id
       WHERE p.id = $1`,
      [id],
      client
    );
    return this._buildProductWithCategories(rows);
  }

  async findAll({ limit = 10, skip = 0 } = {}, client = null) {
    const { rows: countRows } = await this.query(`SELECT COUNT(DISTINCT id) FROM products`, [], client);
    const total = parseInt(countRows[0].count);

    const { rows } = await this.query(
      `SELECT p.*,
              c.id AS category_id,
              c.name AS category_name,
              c.description AS category_description
       FROM (SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2) p
       LEFT JOIN product_categories pc ON p.id = pc.product_id
       LEFT JOIN categories c ON pc.category_id = c.id
       ORDER BY p.id`,
      [limit, skip],
      client
    );

    const productMap = new Map();
    for (const row of rows) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          stock: row.stock,
          sku: row.sku,
          created_at: row.created_at,
          updated_at: row.updated_at,
          categories: [],
        });
      }
      if (row.category_id) {
        productMap.get(row.id).categories.push({
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
        });
      }
    }

    return { data: Array.from(productMap.values()), total };
  }

  async update(id, { name, description, price, stock, sku }, client = null) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(stock); }
    if (sku !== undefined) { fields.push(`sku = $${idx++}`); values.push(sku); }

    if (fields.length === 0) return this.findById(id, client);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
      client
    );
    return rows[0] || null;
  }

  async search({ keyword, categoryIds, minPrice, maxPrice, limit = 10, skip = 0 } = {}, client = null) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (keyword) {
      conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${idx++})`);
      values.push(keyword);
    }
    if (minPrice !== undefined) {
      conditions.push(`p.price >= $${idx++}`);
      values.push(minPrice);
    }
    if (maxPrice !== undefined) {
      conditions.push(`p.price <= $${idx++}`);
      values.push(maxPrice);
    }
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(`p.id IN (SELECT product_id FROM product_categories WHERE category_id = ANY($${idx++}::int[]))`);
      values.push(categoryIds);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(DISTINCT p.id) FROM products p ${where}`;
    const { rows: countRows } = await this.query(countSql, values, client);
    const total = parseInt(countRows[0].count);

    const dataSql = `
      SELECT p.*,
             c.id AS category_id,
             c.name AS category_name,
             c.description AS category_description
      FROM (SELECT DISTINCT p.* FROM products p ${where} ORDER BY p.id LIMIT $${idx++} OFFSET $${idx++}) p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      ORDER BY p.id
    `;
    const { rows } = await this.query(dataSql, [...values, limit, skip], client);

    const productMap = new Map();
    for (const row of rows) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          stock: row.stock,
          sku: row.sku,
          created_at: row.created_at,
          updated_at: row.updated_at,
          categories: [],
        });
      }
      if (row.category_id) {
        productMap.get(row.id).categories.push({
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
        });
      }
    }

    return { data: Array.from(productMap.values()), total };
  }
}

module.exports = ProductRepository;
