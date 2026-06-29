import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../api/axios';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import { AdminRegisterDTO, adminSchema } from '../../validation/schemas';
import styles from './AdminRegister.module.css';

export default function AdminRegister() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminRegisterDTO>({ resolver: zodResolver(adminSchema) });

  const onSubmit = async (data: AdminRegisterDTO) => {
    try {
      await api.post('/register/admin', data);
      toast.success('Admin registered successfully!');
      navigate('/login/admin', { state: { role: 'admin' } }); // Redirect to admin login
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>Admin Registration</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput label="Name" {...register('name')} error={errors.name} />
        <FormInput label="Email" type="email" {...register('email')} error={errors.email} />
        <FormSelect label="Role" {...register('role')} error={errors.role}>
          <option value="">Select Role</option>
          <option value="superadmin">Super Admin</option>
          <option value="useradmin">User Admin</option>
        </FormSelect>
        <FormInput label="Password" type="password" {...register('password')} error={errors.password} />
        <FormInput label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword} />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}