import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../api/axios';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import ImageUpload from '../../components/ImageUpload';
import styles from './AddProduct.module.css';

interface AddProductFormData {
  productName: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
  stockStatus: 'Active' | 'Inactive' | 'Out of Stock';
  image: FileList;
}

export default function AddProduct() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddProductFormData>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: AddProductFormData) => {
    // Basic file type validation
    if (data.image.length === 0) {
      alert('Product image is required');
      return;
    }
    const file = data.image[0];
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only JPG or PNG images are allowed');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('description', data.description);
      formData.append('quantity', data.quantity.toString());
      formData.append('stockStatus', data.stockStatus);
      formData.append('image', file);

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product added successfully!');
      reset();
    } catch (err) {
      alert('Failed to add product. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.formCard}
    >
      <h2 className={styles.heading}>Add New Product</h2>

      <FormInput
        label="Product Name"
        {...register('productName', { required: 'Product name is required' })}
        error={errors.productName}
      />

      <FormSelect
        label="Category"
        {...register('category', { required: 'Category is required' })}
        error={errors.category}
      >
        <option value="">Select category</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Home">Home</option>
      </FormSelect>

      <FormInput
        label="Price"
        type="number"
        step="0.01"
        {...register('price', {
          required: 'Price is required',
          min: { value: 0.01, message: 'Price must be positive' },
          valueAsNumber: true,
        })}
        error={errors.price}
      />

      <FormInput
        label="Description"
        {...register('description', { required: 'Description is required' })}
        error={errors.description}
      />

      <FormInput
        label="Quantity"
        type="number"
        {...register('quantity', {
          required: 'Quantity is required',
          min: { value: 0, message: 'Quantity cannot be negative' },
          valueAsNumber: true,
        })}
        error={errors.quantity}
      />

      <FormSelect
        label="Stock Status"
        {...register('stockStatus', { required: 'Stock status is required' })}
        error={errors.stockStatus}
      >
        <option value="">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Out of Stock">Out of Stock</option>
      </FormSelect>

      <ImageUpload
        label="Product Image"
        {...register('image')}
        accept="image/png, image/jpeg"
        // react-hook-form can't validate file content natively,
        // so we do a manual check on submit
        error={errors.image}
      />

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
}
