import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import styles from './OrderDetails.module.css';

interface Order {
  _id: string;
  productId: {
    _id: string;
    productName: string;
    imageUrl?: string;
  };
  customerId: {
    _id: string;
    name: string;
    email?: string;
    contactNumber?: string;
  };
  totalAmount: number;
  quantity: number;
  shippingAddress: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setError(null);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: 'Pending' | 'Shipped' | 'Delivered') => {
    if (!order) return;
    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status: newStatus });
      setOrder(res.data);
      alert(`Order marked as ${newStatus}`);
    } catch {
      alert('Failed to update order status');
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate(-1)}
        className={styles.backButton}
      >
        &larr; Back to Orders
      </button>

      <h1 className={styles.heading}>Order Details</h1>

      <div className={styles.layout}>
        <div className={styles.imageColumn}>
          {order.productId.imageUrl ? (
            <img
              src={order.productId.imageUrl}
              alt={order.productId.productName}
              className={styles.orderImage}
            />
          ) : (
            <div className={styles.noImagePlaceholder}>
              No image
            </div>
          )}
        </div>

        <div className={styles.infoColumn}>
          <p><strong>Product:</strong> {order.productId.productName}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <hr />

          <h2 className={styles.sectionTitle}>Customer Info</h2>
          <p><strong>Name:</strong> {order.customerId.name}</p>
          {order.customerId.email && <p><strong>Email:</strong> {order.customerId.email}</p>}
          {order.customerId.contactNumber && <p><strong>Contact:</strong> {order.customerId.contactNumber}</p>}

          <div className={styles.actionsRow}>
            {order.status !== 'Shipped' && (
              <button
                onClick={() => updateStatus('Shipped')}
                className={styles.shipButton}
              >
                Mark Shipped
              </button>
            )}
            {order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Delivered')}
                className={styles.deliverButton}
              >
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
