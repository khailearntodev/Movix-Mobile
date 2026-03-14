import api from './api';
import {
    LoginPayload,
    LoginResponse,
    RegisterPayload,
    ResendVerificationPayload,
    User,
    VerifyPayload,
} from '../types/auth';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return response.data.data;
};

export const register = async (payload: RegisterPayload): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', payload);
    return response.data.data;
};

export const verify = async (payload: VerifyPayload): Promise<void> => {
    await api.post('/auth/verify', payload);
};

export const resendVerification = async (payload: ResendVerificationPayload): Promise<void> => {
    await api.post('/auth/resend-verification', payload);
};

export const logout = async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
};

export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken });
    return response.data.data;
};

export const getMe = async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
};
