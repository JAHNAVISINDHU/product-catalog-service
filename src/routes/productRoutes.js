const router = require('express').Router();
const controller = require('../controllers/productController');
const { validateProduct, validateProductUpdate } = require('../middleware/validate');

router.get('/search', controller.searchProducts);
router.get('/', controller.getAllProducts);
router.post('/', validateProduct, controller.createProduct);
router.get('/:id', controller.getProduct);
router.put('/:id', validateProductUpdate, controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
