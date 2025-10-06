import axios from 'axios';
import { User, Studio, Booking, TimeSlot, AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<AuthResponse> => api.post('/auth/register', userData).then(res => res.data),

  login: (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => api.post('/auth/login', credentials).then(res => res.data),

  getCurrentUser: (): Promise<{ user: User }> => api.get('/auth/me').then(res => res.data),
};

// Studio API
export const studioAPI = {
  getAll: (): Promise<Studio[]> => api.get('/studio').then(res => res.data),
  getById: (id: string): Promise<Studio> => api.get(`/studio/${id}`).then(res => res.data),
};

// Booking API
export const bookingAPI = {
  getMyBookings: (): Promise<Booking[]> => api.get('/bookings/my-bookings').then(res => res.data),
  getAllBookings: (): Promise<Booking[]> => api.get('/bookings/all').then(res => res.data),
  create: (bookingData: {
    studioId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    notes?: string;
    equipment?: Array<{ name: string; price: number }>;
    specialRequests?: string;
  }): Promise<{ message: string; booking: Booking }> => 
    api.post('/bookings/create', bookingData).then(res => res.data),
  
  updateStatus: (id: string, status: string): Promise<{ message: string; booking: Booking }> =>
    api.patch(`/bookings/${id}/status`, { status }).then(res => res.data),
  
  cancel: (id: string): Promise<{ message: string }> =>
    api.delete(`/bookings/${id}`).then(res => res.data),
  
  getAvailableSlots: (studioId: string, date: string): Promise<TimeSlot[]> =>
    api.get(`/bookings/available-slots?studioId=${studioId}&date=${date}`).then(res => res.data),
};

export default api;