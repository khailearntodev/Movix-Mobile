import axios from 'axios';
import { API_URL } from '@/constants/config';
import { getAccessToken, getRefreshToken, saveToken, clearToken } from '@/utils/storage';

console.log('API_URL:', API_URL);

let logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => {
    logoutCallback = cb;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, 
});

api.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                
                const { accessToken, refreshToken: newRefreshToken } = data.data;

                await saveToken(accessToken, newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                await clearToken();
                if (logoutCallback) {
                    logoutCallback();
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network Error: Không kết nối được server');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;