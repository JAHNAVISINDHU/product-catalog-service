const router = require('express').Router();
const controller = require('../controllers/categoryController');
const { validateCategory, validateCategoryUpdate } = require('../middleware/validate');

router.get('/', controller.getAllCategories);
router.post('/', validateCategory, controller.createCategory);
router.get('/:id', controller.getCategory);
router.put('/:id', validateCategoryUpdate, controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
