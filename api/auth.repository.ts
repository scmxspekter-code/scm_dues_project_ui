import { customFetch } from '@/utils/customFetch';
import { IApiBaseResponse, User } from '@/types';

interface IAuthenticationResponse {
  accessToken: string;
  accessTokenExpires: number;
  user: User;
}

interface ILoginPayload {
  email: string;
  password: string;
}

interface IUpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export default () => {
  return {
    login: (payload: ILoginPayload): Promise<IApiBaseResponse<IAuthenticationResponse>> => {
      return customFetch('/authentication/login', {
        method: 'POST',
        data: payload,
      });
    },
    me: (): Promise<IApiBaseResponse<User>> => {
      return customFetch('/authentication/me', { method: 'GET' });
    },
    updatePassword: (payload: IUpdatePasswordPayload): Promise<IApiBaseResponse<void>> => {
      return customFetch('/authentication/password', {
        method: 'PATCH',
        data: payload,
      });
    },
  };
};
