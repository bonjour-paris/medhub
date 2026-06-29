import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import styles from './ProductList.module.css';

interface Product {
  _id: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  stockStatus: 'Active' | 'Inactive' | 'Out of Stock';
  imageUrl?: string;
  description?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate(-1)}
        className={styles.backButton}
      >
        &larr; Back to Products
      </button>

      <div className={styles.layout}>
        <div className={styles.imageColumn}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.noImagePlaceholder}>
              No image
            </div>
          )}
        </div>

        <div className={styles.infoColumn}>
          <h1 className={styles.productTitle}>{product.productName}</h1>
          <p className={styles.detailLine}><strong>Category:</strong> {product.category}</p>
          <p className={styles.detailLine}><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p className={styles.detailLine}><strong>Quantity:</strong> {product.quantity}</p>
          <p className={styles.detailLine}><strong>Status:</strong> {product.stockStatus}</p>
          {product.description && product.description.trim() !== '' && (
            <p className={styles.detailLine}><strong>Description:</strong> {product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
