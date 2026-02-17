const express = require('express');
const ProductService = require('../services/ProductService');
const { validateProductCreate } = require('../middleware/validation');
const router = express.Router();

router.post('/', validateProductCreate, async (req, res) => {
  try {
    const product = await ProductService.create(req.body, req.body.category_ids || []);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { skip = 0, limit = 10 } = req.query;
  // Implement pagination
  res.json(await ProductService.getAll(parseInt(skip), parseInt(limit)));
});

router.get('/search', async (req, res) => {
  const { q, category_id, min_price, max_price, skip = 0, limit = 10 } = req.query;
  const results = await ProductService.search({
    q,
    category_ids: category_id ? [category_id] : [],
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    skip: parseInt(skip),
    limit: parseInt(limit)
  });
  res.json(results);
});

// PUT, DELETE similar...

module.exports = router;
