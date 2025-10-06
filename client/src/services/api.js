import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Студии
export const studiosAPI = {
  getAll: () => api.get('/studios'),
  getById: (id) => api.get(`/studios/${id}`),
  getAvailability: (id, date) => api.get(`/studios/${id}/availability?date=${date}`),
};

// Бронирования
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Пользователи
export const usersAPI = {
  getAll: () => api.get('/users'),
  getByEmail: (email) => api.get(`/users/by-email/${email}`),
  getBookings: (email) => api.get(`/users/${email}/bookings`),
  createOrUpdate: (userData) => api.post('/users', userData),
};

export default api;