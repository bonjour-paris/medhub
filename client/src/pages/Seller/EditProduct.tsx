import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import ImageUpload from '../../components/ImageUpload';
import styles from './EditProduct.module.css';

interface EditProductFormData {
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
  stockStatus: 'Active' | 'Inactive' | 'Out of Stock';
  image?: FileList;
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProductFormData>();

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then(res => {
      const p = res.data;
      reset({
        name: p.productName,
        category: p.category,
        price: p.price,
        description: p.description,
        quantity: p.quantity,
        stockStatus: p.stockStatus,
      });
      setLoading(false);
    }).catch(() => {
      alert('Failed to load product');
      setLoading(false);
    });
  }, [id, reset]);

  const onSubmit = async (data: EditProductFormData) => {
    if (!id) return;
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('description', data.description);
      formData.append('quantity', data.quantity.toString());
      formData.append('stockStatus', data.stockStatus);
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product updated!');
      navigate('/seller/products');
    } catch {
      alert('Update failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
      <h2 className={styles.heading}>Edit Product</h2>

      <FormInput label="Product Name" {...register('name', { required: 'Name required' })} error={errors.name} />
      <FormSelect label="Category" {...register('category', { required: 'Category required' })} error={errors.category}>
        <option value="">Select category</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Home">Home</option>
      </FormSelect>
      <FormInput
        label="Price"
        type="number"
        step="0.01"
        {...register('price', { required: 'Price required', min: 0.01 })}
        error={errors.price}
      />
      <FormInput label="Description" {...register('description', { required: 'Description required' })} error={errors.description} />
      <FormInput
        label="Quantity"
        type="number"
        {...register('quantity', { required: 'Quantity required', min: 0 })}
        error={errors.quantity}
      />
      <FormSelect label="Stock Status" {...register('stockStatus', { required: 'Stock status required' })} error={errors.stockStatus}>
        <option value="">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Out of Stock">Out of Stock</option>
      </FormSelect>

      <ImageUpload label="Product Image" {...register('image')} accept="image/png, image/jpeg" />

      <button
        type="submit"
        disabled={submitLoading}
        className={styles.submitButton}
      >
        {submitLoading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
}
