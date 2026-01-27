import { $api } from '@/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Cookie from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { login,setUser } from '@/store/slices/authSlice';
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
const dispatch = useAppDispatch();
  const handleSubmit = async (payload: { email: string, password: string }) => {
    setIsLoading(true);
    
    try {
     const {data:{user,accessToken,accessTokenExpires}} = await $api.auth.login(payload)

     if(accessToken){
       Cookie.set('auth_token', accessToken,{expires:accessTokenExpires});
     }
     toast.success('Login successful');
     dispatch(login({user:user!,token:accessToken!}));
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };
const  me = async ()=>{
  try {
    const {data} = await $api.auth.me();
   dispatch(setUser(data!));
  } catch (error: any) {
    toast.error(error.message || 'Failed to fetch user');
    throw error;
  }
}
  return {
    isLoading,
    handleSubmit,
    me
  };
};
