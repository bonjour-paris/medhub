const express = require('express');
const router = express.Router();
const productController = require('../controller/productcontroller');
const authMiddleware = require('../middleware/authmiddleware'); 
const upload = require('../middleware/upload'); // for image upload
const { validateProduct } = require('../middleware/validators'); // input validation
const { handleValidationErrors } = require('../middleware/errorHandler'); // centralized error handler

// 🔐 Protect all routes
router.use(authMiddleware);

// ✅ Create Product (with image upload + validation)
router.post(
  '/',
  upload.single('image'),
  validateProduct,
  handleValidationErrors,
  productController.createProduct
);

// ✅ Get all (with pagination, search, filter)
router.get('/', productController.getAllProducts);

// ✅ Single product
router.get('/:id', productController.getProductById);

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.filename;  // update image only if a new file is uploaded
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
router.delete('/:id', productController.deleteProduct);

// ✅ Aggregation routes
router.get('/aggregation/users-products', productController.getUsersWithProducts);
router.get('/aggregation/products-category', productController.countProductsByCategory);

module.exports = router;
