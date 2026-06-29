import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().refine((val) => val !== '', { message: 'Role is required' }),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['useradmin', 'superadmin'], { message: 'Select a valid admin role' }),
});

export const sellerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  originCountry: z.string().min(1, 'Origin country is required'),
  logo: z
    .any()
    .refine((files) => files?.length === 1, 'Logo is required')
    .refine(
      (files) => files?.[0]?.type === 'image/jpeg' || files?.[0]?.type === 'image/png',
      'Logo must be JPG or PNG'
    ),
});

export const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['superadmin', 'useradmin'], { message: 'Admin role is required' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type AdminLoginDTO = z.infer<typeof adminLoginSchema>;
export type SellerRegisterDTO = z.infer<typeof sellerSchema>;
export type AdminRegisterDTO = z.infer<typeof adminSchema>;
export type CustomerRegisterDTO = z.infer<typeof customerSchema>;