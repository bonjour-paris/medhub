import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './RegisterLanding.module.css';

export default function RegisterLanding() {
  const navigate = useNavigate();
  const [registerRole, setRegisterRole] = useState('');
  const [loginRole, setLoginRole] = useState('');

  const roles = [
    { label: 'Seller', value: 'seller' },
    { label: 'Customer', value: 'customer' },
    { label: 'Admin', value: 'admin' },
  ];

  const handleRegister = () => {
    if (!registerRole) {
      toast.error('Please select a role to register.');
      return;
    }
    navigate(`/register/${registerRole}`);
  };

  const handleLogin = () => {
    if (!loginRole) {
      toast.error('Please select a role to login.');
      return;
    }
    // Navigate to /login/admin for admin role, otherwise /login
    navigate(loginRole === 'admin' ? '/login/admin' : '/login', { state: { role: loginRole } });
  };

  // After registration, redirect to the appropriate login page
  const handlePostRegisterRedirect = (role: string) => {
    if (role === 'admin') {
      navigate('/login/admin', { state: { role: 'admin' } });
    } else {
      navigate('/login', { state: { role } });
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Company Access Portal</h1>

      <div className={styles.cardRow}>
        {/* Register Card */}
        <div className={styles.card}>
          <h2 className={styles.cardHeading}>Register</h2>
          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
            className={styles.roleSelect}
          >
            <option value="" disabled>
              Select role to register
            </option>
            {roles.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRegister}
            className={styles.actionButton}
          >
            Proceed to Register
          </button>
        </div>

        {/* Login Card */}
        <div className={styles.card}>
          <h2 className={styles.cardHeading}>Login</h2>
          <select
            value={loginRole}
            onChange={(e) => setLoginRole(e.target.value)}
            className={styles.roleSelect}
          >
            <option value="" disabled>
              Select role to login
            </option>
            {roles.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleLogin}
            className={styles.actionButton}
          >
            Proceed to Login
          </button>
        </div>
      </div>
    </div>
  );
}