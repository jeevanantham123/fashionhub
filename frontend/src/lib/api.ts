import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data: any) => api.put('/auth/me', data),
  addresses: () => api.get('/auth/addresses'),
  addAddress: (data: any) => api.post('/auth/addresses', data),
  deleteAddress: (id: string) => api.delete(`/auth/addresses/${id}`),
};

// Products
export const productApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (slug: string) => api.get(`/products/${slug}`),
  suggest: (q: string) => api.get('/products/search-suggest', { params: { q } }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories
export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data: any) => api.post('/cart/items', data),
  updateItem: (id: string, quantity: number) => api.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id: string) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart'),
  merge: (sessionId: string) => api.post('/cart/merge', { sessionId }),
};

// Orders
export const orderApi = {
  create: (data: any) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id: string) => api.get(`/orders/${id}`),
};

// Wishlist
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post('/wishlist', { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

// Reviews
export const reviewApi = {
  list: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (productId: string, data: any) => api.post(`/reviews/product/${productId}`, data),
};

// Coupons
export const couponApi = {
  validate: (code: string, subtotal: number) => api.post('/coupons/validate', { code, subtotal }),
  list: () => api.get('/coupons'),
  create: (data: any) => api.post('/coupons', data),
  update: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Theme
export const themeApi = {
  get: () => api.get('/theme'),
  update: (data: Record<string, string>) => api.put('/theme', data),
};

// Home sections
export const homeSectionApi = {
  list: () => api.get('/home-sections'),
  listAll: () => api.get('/home-sections/all'),
  create: (data: any) => api.post('/home-sections', data),
  update: (id: string, data: any) => api.put(`/home-sections/${id}`, data),
  reorder: (ids: string[]) => api.put('/home-sections/reorder', { ids }),
  delete: (id: string) => api.delete(`/home-sections/${id}`),
};

// Admin
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  orders: (params?: any) => api.get('/admin/orders', { params }),
  getOrder: (id: string) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
  users: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  inventory: () => api.get('/admin/inventory'),
  updateStock: (variantId: string, stock: number) => api.put(`/admin/inventory/${variantId}`, { stock }),
};

// Upload
export const uploadApi = {
  upload: (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
