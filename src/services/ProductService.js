const ProductRepository = require('../repositories/ProductRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const UnitOfWork = require('../repositories/UnitOfWork');

const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();

class ProductService {
  async createProduct(data) {
    const { category_ids = [], ...productData } = data;

    return UnitOfWork.transaction(async (client) => {
      // Validate categories exist
      if (category_ids.length > 0) {
        const cats = await categoryRepo.findByIds(category_ids, client);
        if (cats.length !== category_ids.length) {
          const err = new Error('One or more category IDs are invalid');
          err.status = 400;
          throw err;
        }
      }

      const product = await productRepo.create(productData, client);
      await productRepo.linkCategories(product.id, category_ids, client);
      return productRepo.findById(product.id, client);
    });
  }

  async getProduct(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      const err = new Error(`Product with id ${id} not found`);
      err.status = 404;
      throw err;
    }
    return product;
  }

  async getAllProducts({ limit, skip }) {
    return productRepo.findAll({ limit, skip });
  }

  async updateProduct(id, data) {
    const { category_ids, ...productData } = data;

    return UnitOfWork.transaction(async (client) => {
      const existing = await productRepo.findById(id, client);
      if (!existing) {
        const err = new Error(`Product with id ${id} not found`);
        err.status = 404;
        throw err;
      }

      if (category_ids !== undefined) {
        if (category_ids.length > 0) {
          const cats = await categoryRepo.findByIds(category_ids, client);
          if (cats.length !== category_ids.length) {
            const err = new Error('One or more category IDs are invalid');
            err.status = 400;
            throw err;
          }
        }
        await productRepo.unlinkAllCategories(id, client);
        await productRepo.linkCategories(id, category_ids, client);
      }

      if (Object.keys(productData).length > 0) {
        await productRepo.update(id, productData, client);
      }

      return productRepo.findById(id, client);
    });
  }

  async deleteProduct(id) {
    const deleted = await productRepo.deleteById(id);
    if (!deleted) {
      const err = new Error(`Product with id ${id} not found`);
      err.status = 404;
      throw err;
    }
  }

  async searchProducts({ keyword, category_ids, min_price, max_price, limit, skip }) {
    return productRepo.search({
      keyword,
      categoryIds: category_ids,
      minPrice: min_price,
      maxPrice: max_price,
      limit,
      skip,
    });
  }
}

module.exports = new ProductService();
