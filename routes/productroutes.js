const express = require('express');
const router = express.Router();
const productController = require('../controller/productcontroller');
const authMiddleware = require('../middleware/authmiddleware');
const upload = require('../middleware/upload');
const { validateProduct } = require('../middleware/validators');
const { handleValidationErrors } = require('../middleware/errorhandler');
const isAdmin = require('../middleware/isAdmin');
const { Parser } = require('json2csv');
const Product = require('../models/product');

router.use(authMiddleware);

router.post('/', upload.single('image'), validateProduct, handleValidationErrors, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), validateProduct, handleValidationErrors, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Aggregations
router.get('/aggregation/users-products', productController.getUsersWithProducts);
router.get('/aggregation/products-category', productController.countProductsByCategory);

// CSV Export — admin only
router.get('/download-csv', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().lean();
    const fields = ['name', 'category', 'price', 'availability', 'image'];
    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
