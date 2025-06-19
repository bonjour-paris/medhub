const { body } = require('express-validator');
exports.validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
];

exports.validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('availability').isBoolean().withMessage('Availability must be true or false')
];
