import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  available: number;
}

export interface Reservation {
  id: string;
  eventId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REFUSED';
  reason?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: string;
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/users/login', data),
  
  signup: (data: SignupRequest) => 
    api.post<AuthResponse>('/users/signup', data),
};

// Events API
export const eventsAPI = {
  getAll: () => 
    api.get<Event[]>('/events'),
  
  getById: (id: string) => 
    api.get<Event>(`/events/${id}`),
};

// Reservations API
export const reservationsAPI = {
  create: (eventId: string, userId: string) =>
    api.post<Reservation>('/reservations', { eventId, userId }),
  
  getByUser: (userId: string) =>
    api.get<Reservation[]>(`/reservations/user/${userId}`),
  
  approve: (id: string) =>
    api.post<Reservation>(`/reservations/${id}/approve`),
  
  reject: (id: string, reason: string) =>
    api.post<Reservation>(`/reservations/${id}/reject`, { reason }),
  
  cancel: (id: string) =>
    api.delete(`/reservations/${id}`),
};

export default api;
