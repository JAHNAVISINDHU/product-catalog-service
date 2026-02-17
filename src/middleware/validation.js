const { body, query, validationResult } = require('express-validator');

const validateProductCreate = [
  body('name').isLength({ min: 1, max: 255 }).trim().escape(),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('sku').isLength({ min: 1, max: 100 }).trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

module.exports = { validateProductCreate };
