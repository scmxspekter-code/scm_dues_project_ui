import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import membersReducer from './slices/membersSlice';
import defaultersReducer from './slices/defaultersSlice';
import messagingReducer from './slices/messagingSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    defaulters: defaultersReducer,
    messaging: messagingReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
