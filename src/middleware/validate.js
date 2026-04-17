const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  price: Joi.number().precision(2).min(0).required(),
  stock: Joi.number().integer().min(0).default(0),
  sku: Joi.string().trim().max(100).allow('', null).optional(),
  category_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  sku: Joi.string().trim().max(100).allow('', null).optional(),
  category_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
}).min(1);

const categorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow('', null).optional(),
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).allow('', null).optional(),
}).min(1);

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(d => d.message),
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateProduct: validate(productSchema),
  validateProductUpdate: validate(productUpdateSchema),
  validateCategory: validate(categorySchema),
  validateCategoryUpdate: validate(categoryUpdateSchema),
};
