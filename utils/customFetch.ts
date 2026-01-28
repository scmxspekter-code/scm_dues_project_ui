import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config } from './config';
import Cookie from 'js-cookie';
import { ApiError } from '@/types';

export const customFetch = async <T = unknown>(
  url: string,
  options: AxiosRequestConfig & { responseType?: 'blob' | 'json' }
): Promise<T> => {
  try {
    const token = Cookie.get('auth_token');
    const response = await axios({
      url: `${config.apiUrl}${url}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (options.responseType === 'blob') {
      return response.data as T;
    }

    return { ...response.data } as T;
  } catch (e: unknown) {
    if (e instanceof AxiosError) {
      const error: ApiError = {
        message: e.response?.data?.message || e.message || 'Request failed',
        status: e.response?.status || 500,
        error: e.response?.data?.error,
      };
      throw error;
    } else {
      const error: ApiError = {
        message: e instanceof Error ? e.message : 'Internal Server Error',
        status: 500,
        error: 'Internal Server Error',
      };
      throw error;
    }
  }
};
