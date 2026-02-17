const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category, 'categories');
  }

  async linkProduct(productId, categoryId) {
    await require('../config/database').query(
      'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [productId, categoryId]
    );
  }

  async unlinkProduct(productId, categoryId) {
    await require('../config/database').query(
      'DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2',
      [productId, categoryId]
    );
  }
}

module.exports = CategoryRepository;
