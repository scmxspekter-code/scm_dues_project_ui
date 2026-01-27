import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeAuth, logout } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';

export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const { me } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize auth state from cookie on mount
    if (!hasInitialized.current) {
      dispatch(initializeAuth());
      hasInitialized.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    // If authenticated with token but no user data, fetch user
    if (isAuthenticated && token && !user) {
      me().catch((error) => {
        // If fetching user fails, token might be invalid
        console.error('Failed to fetch user:', error);
        dispatch(logout());
      });
    }
  }, [isAuthenticated, token, user, me, dispatch]);

  return <>{children}</>;
};
