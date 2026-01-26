import { LOGIN_URL } from '@/config/path';
import axios from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_TERITAGE_API}/api`,
  timeout: 36000,
});

// Add a request interceptor
client.interceptors.request.use(
  async (config) => {
    // Do something before request is sent
    const token = getCookie('teritage_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalConfig = error.config;

  if (error?.response && error?.response?.status === 401 && !originalConfig._retry) {
    originalConfig._retry = true;
    if (typeof window !== 'undefined') {
      deleteCookie('teritage_token');
    }
    window.location.replace(LOGIN_URL);
    // Call refresh token
    try {
        return client(originalConfig);
      } catch (_error: any) {
        if (_error.response && _error.response.data) {
          return Promise.reject(_error.response.data);
        }

        return Promise.reject(_error);
      }
    }

    // Handle Network Error (no response object)
    if (error?.code === 'ERR_NETWORK') {
      return Promise.reject({
        response: {
          data: {
            error: {
              message: 'Network error, please check your connection',
            },
          },
        },
      });
    }

    if (error?.response?.status === 500) {
      error.response.data.message = error.response.data.message || 'Something went wrong, Please try again!';
    }
    return Promise.reject(error);
  }
);

export default client;
