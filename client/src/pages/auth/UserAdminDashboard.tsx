import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../api/axios';
import styles from './UserAdminDashboard.module.css';

interface Seller {
  _id: string;
  companyName: string;
  email: string;
  contactNumber: string;
  originCountry: string;
  logoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  sellerId: string;
}

export default function UserAdminDashboard() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const fetchSellers = async () => {
    console.log('Fetching pending sellers...');
    try {
      const res = await api.get('/api/admin/pending-sellers');
      console.log('API Response:', res.data);
      if (Array.isArray(res.data)) {
        setSellers(res.data);
      } else {
        console.log('Invalid response format:', res.data);
        setSellers([]);
      }
      setLoading(false);
    } catch (err: any) {
      console.log('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch pending sellers');
      toast.error(error || 'Failed to fetch pending sellers');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/login/admin');
      }
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchSellers();
  }, [navigate]);

  const handleApproval = async (sellerId: string, approve: boolean) => {
    if (approve) setApproving(sellerId);
    else setRejecting(sellerId);
    try {
      const res = await api.post(`/api/admin/seller-approval/${sellerId}`, { approve });
      console.log('Approval response:', res.data);
      if (res.data.success) {
        if (approve) {
          toast.success(res.data.message); // "Seller has been approved"
          // Update local state to reflect approved status
          setSellers(sellers.map(s => 
            s._id === sellerId ? { ...s, status: 'approved' } : s
          ));
        } else {
          toast.success(res.data.message); // "Seller has been rejected"
          // Seller is already deleted on the server, remove from state
          setSellers(sellers.filter(s => s._id !== sellerId));
        }
        await fetchSellers(); // Re-fetch to ensure consistency
      } else {
        toast.error('Action failed due to server issue');
      }
    } catch (err: any) {
      console.log('Approval error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setApproving(null);
      setRejecting(null);
    }
  };

  console.log('Sellers state:', sellers);

  if (loading) return <div className={styles.centerMessage}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Admin Dashboard</h1>
      {sellers.length === 0 ? (
        <p>No pending sellers</p>
      ) : (
        <div className={styles.sellerList}>
          {sellers.map((seller) => (
            <div key={seller._id} className={styles.sellerRow}>
              <div>
                <h2 className={styles.companyName}>{seller.companyName}</h2>
                <p>Email: {seller.email}</p>
                <p>Contact: {seller.contactNumber}</p>
                <p>Country: {seller.originCountry}</p>
                <img src={seller.logoUrl} alt="Logo" className={styles.logo} />
                {seller.status === 'approved' && (
                  <span className={styles.approvedTag}>✓ Approved</span>
                )}
              </div>
              <div className={styles.actions}>
                {seller.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproval(seller._id, true)}
                      className={styles.approveButton}
                      disabled={approving === seller._id || rejecting === seller._id}
                    >
                      {approving === seller._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApproval(seller._id, false)}
                      className={styles.rejectButton}
                      disabled={approving === seller._id || rejecting === seller._id}
                    >
                      {rejecting === seller._id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}