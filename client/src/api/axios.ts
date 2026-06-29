import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../utils/auth'; // Adjust path as needed

export const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('Token from getAuthToken:', token ? 'Present' : 'Absent');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No token found');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request:', error.message);
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export default api;