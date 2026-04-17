const categoryService = require('../services/CategoryService');

const parsePagination = (query) => ({
  limit: Math.min(parseInt(query.limit) || 10, 100),
  skip: parseInt(query.skip) || 0,
});

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) { next(err); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategory(parseInt(req.params.id));
    res.json(category);
  } catch (err) { next(err); }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req.query);
    const result = await categoryService.getAllCategories({ limit, skip });
    res.json({ ...result, limit, skip });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(parseInt(req.params.id), req.body);
    res.json(category);
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
};
