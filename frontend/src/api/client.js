import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		const status = err?.response?.status;
		if (status === 401) {
			localStorage.removeItem('token');
		}
		return Promise.reject(err);
	}
);

export function formatBytes(bytes) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}


