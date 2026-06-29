import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './OrderList.module.css';

interface Order {
  _id: string;
  productId: {
    productName: string;
    imageUrl?: string;
  };
  customerId: {
    name: string;
  };
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Shipped' | 'Delivered'>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const statusQuery = filter !== 'All' ? `?status=${filter}` : '';
        const res = await api.get(`/orders${statusQuery}`);
        setOrders(res.data);
        setError(null);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const handleRowClick = (id: string) => {
    navigate(`/seller/orders/${id}`);
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Orders</h1>

      <div className={styles.filterRow}>
        {['All', 'Pending', 'Shipped', 'Delivered'].map((status) => (
          <button
            key={status}
            className={filter === status ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setFilter(status as any)}
          >
            {status}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Total Amount</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={styles.row}
                  onClick={() => handleRowClick(order._id)}
                >
                  <td className={styles.productCell}>
                    {order.productId.imageUrl ? (
                      <img
                        src={order.productId.imageUrl}
                        alt={order.productId.productName}
                        className={styles.thumbnail}
                      />
                    ) : (
                      <div className={styles.thumbnailPlaceholder}>
                        No Img
                      </div>
                    )}
                    {order.productId.productName}
                  </td>
                  <td className={styles.td}>{order.customerId.name}</td>
                  <td className={styles.td}>${order.totalAmount.toFixed(2)}</td>
                  <td className={styles.td}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
