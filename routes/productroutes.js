const express = require('express');
const router = express.Router();
const productController = require('../controller/productcontroller');
const authMiddleware = require('../middleware/authmiddleware'); 

// Protect all routes
router.use(authMiddleware);

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Aggregation routes
router.get('/aggregation/users-products', productController.getUsersWithProducts);
router.get('/aggregation/products-category', productController.countProductsByCategory);

module.exports = router;
