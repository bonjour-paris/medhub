  import mongoose, { Schema, Document } from 'mongoose';

  export interface IProduct extends Document {
    name: string;
    category: string;
    price: number;
    description: string;
    quantity: number;
    stockStatus: 'Active' | 'Inactive' | 'Out of Stock';
    imageUrl: string;
  }

  const productSchema = new Schema<IProduct>(
    {
      name: { type: String, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      stockStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Out of Stock'],
        default: 'Active',
      },
      imageUrl: { type: String, required: true }
    },
    { timestamps: true }
  );

  export default mongoose.model<IProduct>('Product', productSchema);
