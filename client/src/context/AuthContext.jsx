import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const signup = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/signup', { email, password });

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed',
            };
        }
    };

    const loginWithToken = async (token) => {
        try {
            // Token will be added by interceptor if we set it in localStorage first? 
            // Actually, we are passing it directly, but for this call we might need to manually set header 
            // OR just rely on the fact that userInfo isn't set yet.
            // Wait, the interceptor reads from localStorage. We haven't set it yet.
            // So we should manually pass the header here.
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await api.get('/api/auth/me', config);

            // Merge token with user data
            const userData = { ...data, token };

            localStorage.setItem('userInfo', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error fetching social user:', error);
            // Fallback or logout if token invalid
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('lastActiveDocumentId');
        // Optional: clear all chat history or rely on component logic to clear/refresh
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, loginWithToken, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
