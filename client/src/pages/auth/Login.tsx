import { Ref, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../api/axios';
import { setAuthToken, clearAuthToken } from '../../utils/auth';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import { LoginDTO, loginSchema, AdminLoginDTO, adminLoginSchema } from '../../validation/schemas';
import styles from './Login.module.css';

// Define FieldError type from react-hook-form
interface FieldError {
  type: string;
  message?: string;
  ref?: Ref;
  types?: Record<string, string>;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.includes('/login/admin') || location.state?.role === 'admin';

  useEffect(() => {
    if (location.state?.role === 'admin' && !location.pathname.includes('/login/admin')) {
      navigate('/login/admin', { replace: true, state: { role: 'admin' } });
    }
    if (location.state?.fromRegistration === 'seller') {
      setValue('role', 'seller', { shouldValidate: true });
      setValue('email', location.state.email, { shouldValidate: true });
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<LoginDTO | AdminLoginDTO>({
    resolver: zodResolver(isAdminLogin ? adminLoginSchema : loginSchema),
    defaultValues: { role: isAdminLogin ? undefined : 'seller' },
  });

  const onSubmit = async (data: LoginDTO | AdminLoginDTO) => {
    try {
      console.log('Login form data submitted:', {
        email: data.email,
        password: data.password,
        role: isAdminLogin ? 'admin' : data.role,
        adminRole: isAdminLogin ? data.role : undefined,
      });

      const res = await api.post('/login', {
        email: data.email,
        password: data.password,
        role: isAdminLogin ? 'admin' : data.role,
        ...(isAdminLogin && { adminRole: data.role }),
      });

      console.log('Login response from server:', res.data);
      if (res.data.token) {
        setAuthToken(res.data.token);
        localStorage.setItem('role', isAdminLogin ? 'admin' : data.role);
        console.log('Token set:', res.data.token.substring(0, 20) + '...');
      }
      if (res.data.redirect) {
        navigate(res.data.redirect);
        const roleMessage = isAdminLogin ? 'Admin' : data.role.charAt(0).toUpperCase() + data.role.slice(1);
        toast.success(`${roleMessage} login successful!`);
      }
    } catch (err: any) {
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.response?.data?.message || err.message,
      });

      if (err.response?.status === 403 && err.response?.data?.message === 'Your seller account is not yet approved. Please wait for admin approval.') {
        setError('root', {
          type: 'manual',
          message: 'Your seller account is not yet approved. Please wait for admin approval.',
        });
      } else if (err.response?.status === 401) {
        setError('password', {
          type: 'manual',
          message: 'Invalid email or password.',
        });
        clearAuthToken();
      } else {
        setError('root', {
          type: 'manual',
          message: err.response?.data?.message || 'Login failed. Please try again.',
        });
      }
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>{isAdminLogin ? 'Admin Login' : 'Login'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email || (errors.root && { ...errors.root, type: 'manual' })}
        />
        <FormInput
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password}
        />
        {!isAdminLogin && location.state?.fromRegistration === 'seller' && (
          <input type="hidden" {...register('role')} value="seller" />
        )}
        {!isAdminLogin && !location.state?.fromRegistration && (
          <FormSelect label="Role" {...register('role')} error={errors.role}>
            <option value="">Select Role</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </FormSelect>
        )}
        {isAdminLogin && (
          <FormSelect label="Role" {...register('role')} error={errors.role}>
            <option value="">Select Role</option>
            <option value="useradmin">User Admin</option>
            <option value="superadmin">Super Admin</option>
          </FormSelect>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        {errors.root && <p className={styles.rootError}>{errors.root.message}</p>}
      </form>
    </div>
  );
}