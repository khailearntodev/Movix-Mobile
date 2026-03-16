import { Platform } from 'react-native';

const API_URL_ENV = process.env.EXPO_PUBLIC_API_URL;
const SOCKET_URL_ENV = process.env.EXPO_PUBLIC_SOCKET_URL;

const DEFAULT_HOST = Platform.select({
    android: 'http://10.0.2.2:5000',
    ios: 'http://localhost:5000',
    default: 'http://192.168.109.200:5000',
});

export const API_URL = API_URL_ENV || `${DEFAULT_HOST}/api`;
export const SOCKET_URL = SOCKET_URL_ENV || DEFAULT_HOST;