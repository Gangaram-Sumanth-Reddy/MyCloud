import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const restoreSession = useCallback(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			setUser(null);
			setLoading(false);
			return null;
		}
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
		setLoading(true);
		try {
			const res = await api.get('/auth/me');
			setUser(res.data.user);
			return res.data.user;
		} catch (error) {
			console.error('Session Restore Error:', error);
			localStorage.removeItem('token');
			setUser(null);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	const login = useCallback(async (email, password) => {
		try {
			const res = await api.post('/auth/login', { email, password });
			localStorage.setItem('token', res.data.token);
			api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
			setUser(res.data.user);
			return res.data;
		} catch (error) {
			console.error('Login Error:', error);
			const message = error?.response?.data?.message || 'Unable to sign in';
			const details = error?.response?.data?.errors || null;
			const err = new Error(message);
			err.response = error?.response;
			err.details = details;
			throw err;
		}
	}, []);

	const signup = useCallback(async (name, email, password) => {
		try {
			const res = await api.post('/auth/signup', { name, email, password });
			if (res.data?.token) {
				localStorage.setItem('token', res.data.token);
				api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
				setUser(res.data.user);
			}
			return res.data;
		} catch (error) {
			console.error('Sign Up Error:', error);
			const message = error?.response?.data?.message || 'Unable to sign up';
			const details = error?.response?.data?.errors || null;
			const err = new Error(message);
			err.response = error?.response;
			err.details = details;
			throw err;
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem('token');
		delete api.defaults.headers.common.Authorization;
		setUser(null);
	}, []);

	const value = useMemo(() => ({
		user,
		loading,
		login,
		signup,
		logout,
		restoreSession,
	}), [user, loading, login, signup, logout, restoreSession]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}


