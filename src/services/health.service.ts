import api from './api.service';
export const checkHealth = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    }
    catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};