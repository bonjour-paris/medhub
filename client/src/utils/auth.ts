const TOKEN_KEY = 'token';

// Save JWT token to localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove JWT token (logout)
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return !!getAuthToken();
};