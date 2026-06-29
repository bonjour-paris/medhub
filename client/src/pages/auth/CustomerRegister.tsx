import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../../validation/schemas';
import { CustomerRegisterDTO } from '../../types';
import { api } from '../../api/axios';
import FormInput from '../../components/FormInput';
import styles from './CustomerRegister.module.css';

export default function CustomerRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CustomerRegisterDTO>({ resolver: zodResolver(customerSchema) });

  const onSubmit = async (data: CustomerRegisterDTO) => {
    await api.post('/register/customer', data);
    alert('Customer registered!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h1 className={styles.heading}>Customer Registration</h1>

      <FormInput label="Name" {...register('name')} error={errors.name} />
      <FormInput label="Email" type="email" {...register('email')} error={errors.email} />
      <FormInput label="Password" type="password" {...register('password')} error={errors.password} />
      <FormInput
        label="Confirm Password"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
  