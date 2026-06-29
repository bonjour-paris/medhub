export type Role = 'seller' | 'customer' | 'admin';
export type AdminRole = 'superadmin' | 'useradmin';

export interface SellerRegisterDTO {
  companyName: string;
  email: string;
  contactNumber: string;
  originCountry: string;
  logo?: FileList;
}

export interface CustomerRegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AdminRegisterDTO extends Omit<CustomerRegisterDTO, 'confirmPassword'> {
  role: AdminRole;
  confirmPassword: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  role: Role;
}