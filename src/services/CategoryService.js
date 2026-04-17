const CategoryRepository = require('../repositories/CategoryRepository');

const categoryRepo = new CategoryRepository();

class CategoryService {
  async createCategory(data) {
    return categoryRepo.create(data);
  }

  async getCategory(id) {
    const cat = await categoryRepo.findById(id);
    if (!cat) {
      const err = new Error(`Category with id ${id} not found`);
      err.status = 404;
      throw err;
    }
    return cat;
  }

  async getAllCategories({ limit, skip }) {
    return categoryRepo.findAll({ limit, skip });
  }

  async updateCategory(id, data) {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      const err = new Error(`Category with id ${id} not found`);
      err.status = 404;
      throw err;
    }
    return categoryRepo.update(id, data);
  }

  async deleteCategory(id) {
    const deleted = await categoryRepo.deleteById(id);
    if (!deleted) {
      const err = new Error(`Category with id ${id} not found`);
      err.status = 404;
      throw err;
    }
  }
}

module.exports = new CategoryService();
