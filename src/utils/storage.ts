import AsyncStorage from '@react-native-async-storage/async-storage';

// Key để lưu trữ
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken'; 

export const getAccessToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

export const getRefreshToken = async () => {
    try {
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

export const saveToken = async (accessToken: string, refreshToken?: string) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    } catch (error) {
        console.error('Lỗi lưu token:', error);
    }
};

export const clearToken = async () => {
    try {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
        console.error('Lỗi xóa token:', error);
    }
};
