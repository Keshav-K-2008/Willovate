import client from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const login = (data: LoginRequest) =>
  client.post<LoginResponse>('/api/auth/login', data).then((r) => r.data);

export const register = (data: RegisterRequest) =>
  client.post<{ message: string }>('/api/auth/register', data).then((r) => r.data);
