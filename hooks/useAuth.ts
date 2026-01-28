import { $api } from '@/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Cookie from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { login, setUser } from '@/store/slices/authSlice';
import { isApiError } from '@/types';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async (payload: { email: string; password: string }): Promise<void> => {
    setIsLoading(true);

    try {
      const {
        data: { user, accessToken, accessTokenExpires },
      } = await $api.auth.login(payload);

      if (accessToken) {
        Cookie.set('auth_token', accessToken, { expires: accessTokenExpires });
      }
      toast.success('Login successful');
      dispatch(login({ user: user!, token: accessToken! }));
    } catch (err: unknown) {
      if (isApiError(err)) {
        toast.error(err.message || 'Login failed');
      } else {
        toast.error('Login failed');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const me = async (): Promise<void> => {
    try {
      const { data } = await $api.auth.me();
      dispatch(setUser(data!));
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch user');
      } else {
        toast.error('Failed to fetch user');
      }
      throw error;
    }
  };

  return {
    isLoading,
    handleSubmit,
    me,
  };
};
