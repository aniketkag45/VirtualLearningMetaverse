import axios from 'axios';
import type { User } from '../stores/useAuthStore';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface BackendAuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  userId: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SCHOOL_OWNER';
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const roleToUserType = (role: BackendAuthResponse['role']): User['userType'] => {
  if (role === 'TEACHER' || role === 'SCHOOL_OWNER') return 'teacher';
  if (role === 'ADMIN') return 'admin';
  return 'student';
};

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    const response = await apiClient.post<ApiEnvelope<BackendAuthResponse>>('/auth/login', {
      email,
      password,
    });

    const auth = response.data.data;
    return {
      accessToken: auth.accessToken,
      user: {
        id: auth.userId,
        email: auth.email,
        name: auth.fullName,
        userType: roleToUserType(auth.role),
      },
    };
  },

  async register(input: {
    email: string;
    fullName: string;
    password: string;
    role: BackendAuthResponse['role'];
  }): Promise<{ user: User; accessToken: string }> {
    const response = await apiClient.post<ApiEnvelope<BackendAuthResponse>>('/auth/register', input);
    const auth = response.data.data;
    return {
      accessToken: auth.accessToken,
      user: {
        id: auth.userId,
        email: auth.email,
        name: auth.fullName,
        userType: roleToUserType(auth.role),
      },
    };
  },
};

export default apiClient;
