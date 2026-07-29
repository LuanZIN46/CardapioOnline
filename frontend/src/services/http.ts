import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Não foi possível concluir a requisição.';
    return Promise.reject(new Error(message));
  },
);
