import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  productId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  totalAmount: number;
  quantity: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  shippingAddress: string;
  orderDate: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered'],
      default: 'Pending',
      required: true,
    },
    shippingAddress: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
