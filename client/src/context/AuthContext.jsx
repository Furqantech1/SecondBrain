import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// Clear all user-specific session data from localStorage
const clearUserSessionData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('chatHistory_') || key.startsWith('lastActiveDocId_'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    // Also remove legacy non-namespaced key
    localStorage.removeItem('lastActiveDocumentId');
};

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
            clearUserSessionData(); // Clear previous user's data
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
            clearUserSessionData(); // Clear any stale data
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
        clearUserSessionData(); // Remove all user-specific data
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, loginWithToken, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
