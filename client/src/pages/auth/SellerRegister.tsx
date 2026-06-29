import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { sellerSchema } from '../../validation/schemas';
import { SellerRegisterDTO } from '../../types';

import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import ImageUpload from '../../components/ImageUpload';
import { api } from '../../api/axios';
import styles from './SellerRegister.module.css';

export default function SellerRegister() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SellerRegisterDTO>({
    resolver: zodResolver(sellerSchema),
    defaultValues: { logo: undefined }
  });

  const onSubmit = async (data: SellerRegisterDTO) => {
    try {
      const fd = new FormData();
      fd.append('companyName', data.companyName);
      fd.append('email', data.email);
      fd.append('contactNumber', data.contactNumber);
      fd.append('originCountry', data.originCountry);

      if (data.logo && data.logo.length > 0) {
        fd.append('logo', data.logo[0]);
      }

      const response = await api.post('/register/seller', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Server response:', response.data);
      alert('Seller registered!');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration failed:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      alert(`Registration failed. Please try again. Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h1 className={styles.heading}>Seller Registration</h1>

      <FormInput label="Company Name" {...register('companyName')} error={errors.companyName} />
      <FormInput label="Email" type="email" {...register('email')} error={errors.email} />
      <FormInput
        label="Contact Number"
        type="tel"
        {...register('contactNumber')}
        error={errors.contactNumber}
      />

      <FormSelect label="Origin Country" {...register('originCountry')} error={errors.originCountry}>
        <option value="">Choose</option>
        <option value="UAE">UAE</option>
        <option value="India">India</option>
        <option value="USA">USA</option>
      </FormSelect>

      <ImageUpload label="Company Logo" {...register('logo')} error={errors.logo} />

      <button className={styles.submitButton}>Register</button>
    </form>
  );
}