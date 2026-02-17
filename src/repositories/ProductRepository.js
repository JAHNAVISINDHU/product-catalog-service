const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');
const { query } = require('../config/database');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product, 'products');
  }

  async search({ q = '', category_ids = [], min_price, max_price, skip = 0, limit = 10 }) {
    let sql = `
      SELECT DISTINCT p.*, array_agg(c.id) as category_ids 
      FROM products p 
      LEFT JOIN product_categories pc ON p.id = pc.product_id 
      LEFT JOIN categories c ON pc.category_id = c.id 
      WHERE true
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
      sql += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ to_tsquery('english', $${paramIndex})`;
      params.push(q + ':*');
      paramIndex++;
    }

    if (category_ids.length) {
      const placeholders = category_ids.map((_, i) => `$${paramIndex + i}`).join(',');
      sql += ` AND pc.category_id = ANY(ARRAY[${placeholders}]::uuid[])`;
      params.push(...category_ids);
      paramIndex += category_ids.length;
    }

    if (min_price !== undefined) {
      sql += ` AND p.price >= $${paramIndex}`;
      params.push(min_price);
      paramIndex++;
    }

    if (max_price !== undefined) {
      sql += ` AND p.price <= $${paramIndex}`;
      params.push(max_price);
      paramIndex++;
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, skip);

    const res = await query(sql, params);
    return res.rows.map(row => new Product({ ...row, category_ids: row.category_ids || [] }));
  }
}

module.exports = ProductRepository;
"/* Repository Pattern Implementation */" 
