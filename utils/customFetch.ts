import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config } from './config';
import Cookie from 'js-cookie';
import { IApiBaseResponse } from '@/types';
export const customFetch = async (url: string, options: AxiosRequestConfig) => {
  try {
    const token = Cookie.get('auth_token');
    const response = await axios<IApiBaseResponse<any>>({
      url: `${config.apiUrl}${url}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });
    return { ...response.data };
  } catch (e) {
    if (e instanceof AxiosError) {
      throw {
        message: e.response?.data?.message,
        status: e.response?.status,
        error: e.response?.data?.error,
      };
    } else {
      throw { message: e.message, status: 500, error: 'Internal Server Error' };
    }
  }
};
