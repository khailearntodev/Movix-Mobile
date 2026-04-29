import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginPayload, RegisterPayload } from '@/types/auth';
import * as authService from '@/services/auth.service';
import { getAccessToken, saveToken, clearToken } from '@/utils/storage';
import { setLogoutCallback } from '@/services/api.service';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (payload: LoginPayload) => Promise<void>;
    signUp: (payload: RegisterPayload) => Promise<User>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const signOut = async () => {
        try {
            setIsLoading(true);
            await clearToken();
            setUser(null);
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getAccessToken();
                if (token) {
                    const userData = await authService.getMe();
                    setUser(userData);
                }
            } catch (error) {
                console.log('Phiên đăng nhập hết hạn hoặc lỗi:', error);
                await signOut();
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        setLogoutCallback(signOut);
        return () => {
            setLogoutCallback(() => { });
        };
    }, []);

    const signIn = async (payload: LoginPayload) => {
        try {
            setIsLoading(true);
            const response = await authService.login(payload);

            await saveToken(response.accessToken, response.refreshToken);

            const userData = await authService.getMe();
            setUser(userData);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (payload: RegisterPayload) => {
        try {
            setIsLoading(true);
            const newUser = await authService.register(payload);
            return newUser;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signIn,
            signUp,
            signOut,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
