import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { $api } from '@/api';
import Cookie from 'js-cookie';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: Cookie.get('auth_token') || null,
  isAuthenticated: !!Cookie.get('auth_token'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      Cookie.remove('auth_token');
    },
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = Cookie.get('auth_token');
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const { logout, login, initializeAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
