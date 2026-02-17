const ProductRepository = require('./ProductRepository');
const CategoryRepository = require('./CategoryRepository');
const { getClient } = require('../config/database');

class UnitOfWork {
  constructor() {
    this._productRepo = null;
    this._categoryRepo = null;
    this._client = null;
    this._transaction = false;
  }

  async begin() {
    this._client = await getClient();
    await this._client.query('BEGIN');
    this._transaction = true;
  }

  get products() {
    if (!this._productRepo) {
      this._productRepo = new ProductRepository();
      this._productRepo.db = { query: this._client.query.bind(this._client) };
    }
    return this._productRepo;
  }

  get categories() {
    if (!this._categoryRepo) {
      this._categoryRepo = new CategoryRepository();
      this._categoryRepo.db = { query: this._client.query.bind(this._client) };
    }
    return this._categoryRepo;
  }

  async commit() {
    if (this._transaction) {
      await this._client.query('COMMIT');
      this._client.release();
      this._transaction = false;
    }
  }

  async rollback() {
    if (this._transaction) {
      await this._client.query('ROLLBACK');
      this._client.release();
      this._transaction = false;
    }
  }
}

module.exports = UnitOfWork;
