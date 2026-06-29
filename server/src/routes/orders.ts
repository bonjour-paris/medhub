import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';          // ← NEW import

const router = express.Router();

/* ─────────────── CREATE ORDER ─────────────── */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, customerId, totalAmount, quantity, shippingAddress } = req.body;

    if (!productId || !customerId || !totalAmount || !quantity || !shippingAddress) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check product exists & inventory
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.quantity < quantity) {
      res.status(400).json({ message: 'Not enough stock available' });
      return;
    }

    // Decrease inventory and update stock status
    product.quantity -= quantity;
    if (product.quantity === 0) product.stockStatus = 'Out of Stock';
    await product.save();

    // Create the order
    const newOrder = new Order({
      productId,
      customerId,
      totalAmount,
      quantity,
      shippingAddress,
      status: 'Pending',
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/* ─────────────── GET ORDERS (with optional status filter) ─────────────── */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('productId')
      .populate('customerId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/* ─────────────── GET SINGLE ORDER ─────────────── */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId')
      .populate('customerId');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/* ─────────────── UPDATE ORDER STATUS ─────────────── */
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/* ─────────────── DELETE ORDER ─────────────── */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
