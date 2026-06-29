import RegisterLanding from './pages/auth/RegisterLanding';
import Login from './pages/auth/Login';
import UserAdminDashboard from './pages/auth/UserAdminDashboard';
import SellerDashboard from './pages/Seller/Dashboard';
import SellerRegister from './pages/auth/SellerRegister';
import CustomerRegister from './pages/auth/CustomerRegister';
import AdminRegister from './pages/auth/AdminRegister';
import AddProduct from './pages/Seller/AddProduct';
import EditProduct from './pages/Seller/EditProduct';
import OrderDetails from './pages/Seller/OrderDetails';
import OrderList from './pages/Seller/OrderList';
import ProductDetails from './pages/Seller/ProductDetails';

export const routes = [
  { path: '/', element: <RegisterLanding /> }, // Added root path
  { path: '/login', element: <Login /> },
  { path: '/login/admin', element: <Login /> },
  { path: '/useradmin', element: <UserAdminDashboard /> },
  { path: '/seller/dashboard', element: <SellerDashboard /> },
  { path: '/register/seller', element: <SellerRegister /> },
  { path: '/register/customer', element: <CustomerRegister /> },
  { path: '/register/admin', element: <AdminRegister /> },
  { path: '/customer', element: <div>Customer Homepage</div> },
  { path: '/seller/products/add', element: <AddProduct /> },
  { path: '/seller/products/edit/:id', element: <EditProduct /> },
  { path: '/seller/orders/:id', element: <OrderDetails /> },
  { path: '/seller/orders', element: <OrderList /> },
  { path: '/seller/products/:id', element: <ProductDetails /> },
];