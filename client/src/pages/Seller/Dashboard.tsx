import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const productsRes = await api.get('/products');
        const products = productsRes.data;
        setTotalProducts(products.length);
        const outStockCount = products.filter((p: any) => p.stockStatus === 'Out of Stock').length;
        setOutOfStock(outStockCount);

        const ordersRes = await api.get('/orders');
        const orders = ordersRes.data;
        setTotalOrders(orders.length);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleChangePassword = async () => {
    navigate('/seller/change-password');
  };

  if (loading) {
    return <p className={styles.loadingMessage}>Loading dashboard data...</p>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Seller Dashboard</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Products</p>
          <p className={styles.statValue}>{totalProducts}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Orders</p>
          <p className={styles.statValue}>{totalOrders}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Out of Stock</p>
          <p className={styles.statValueAlert}>{outOfStock}</p>
        </div>
      </div>
      <div className={styles.chartPlaceholder}>
        Order Activity Chart (coming soon)
      </div>
      <button
        onClick={handleChangePassword}
        className={styles.changePasswordButton}
      >
        Change Password
      </button>
    </div>
  );
}