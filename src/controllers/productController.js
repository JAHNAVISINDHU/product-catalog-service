const productService = require('../services/ProductService');

const parsePagination = (query) => ({
  limit: Math.min(parseInt(query.limit) || 10, 100),
  skip: parseInt(query.skip) || 0,
});

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(parseInt(req.params.id));
    res.json(product);
  } catch (err) { next(err); }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req.query);
    const result = await productService.getAllProducts({ limit, skip });
    res.json({ ...result, limit, skip });
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(parseInt(req.params.id), req.body);
    res.json(product);
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req.query);
    const { keyword, min_price, max_price } = req.query;
    const category_ids = req.query.category_ids
      ? String(req.query.category_ids).split(',').map(Number).filter(Boolean)
      : undefined;

    if (min_price !== undefined && isNaN(parseFloat(min_price))) {
      return res.status(400).json({ error: 'Bad Request', message: 'min_price must be a number' });
    }
    if (max_price !== undefined && isNaN(parseFloat(max_price))) {
      return res.status(400).json({ error: 'Bad Request', message: 'max_price must be a number' });
    }

    const result = await productService.searchProducts({
      keyword,
      category_ids,
      min_price: min_price !== undefined ? parseFloat(min_price) : undefined,
      max_price: max_price !== undefined ? parseFloat(max_price) : undefined,
      limit,
      skip,
    });
    res.json({ ...result, limit, skip });
  } catch (err) { next(err); }
};
