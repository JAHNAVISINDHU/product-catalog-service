const UnitOfWork = require('../repositories/UnitOfWork');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

class ProductService {
  static async create(validatedData, categoryIds = []) {
    const uow = new UnitOfWork();
    try {
      await uow.begin();
      const product = await uow.products.create(validatedData);
      for (const catId of categoryIds) {
        await uow.categories.linkProduct(product.id, catId);
      }
      await uow.commit();
      return product;
    } catch (error) {
      await uow.rollback();
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  static async getById(id) {
    return await require('../repositories/ProductRepository').getById(id);
  }

  static async search(params) {
    return await require('../repositories/ProductRepository').search(params);
  }

  // Add update, delete similarly with UoW
}

module.exports = ProductService;
