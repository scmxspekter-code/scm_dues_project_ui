import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageLog } from '@/types';

export type RecipientType = 'defaulters' | 'paid' | 'all' | 'custom';
export type Channel = 'whatsapp' | 'sms';

interface MessagingState {
  recipientType: RecipientType;
  channel: Channel;
  message: string;
  messageHistory: MessageLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagingState = {
  recipientType: 'defaulters',
  channel: 'whatsapp',
  message: '',
  messageHistory: [],
  isLoading: false,
  error: null,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setRecipientType: (state, action: PayloadAction<RecipientType>) => {
      state.recipientType = action.payload;
    },
    setChannel: (state, action: PayloadAction<Channel>) => {
      state.channel = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setMessageHistory: (state, action: PayloadAction<MessageLog[]>) => {
      state.messageHistory = action.payload;
    },
    clearMessage: (state) => {
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRecipientType,
  setChannel,
  setMessage,
  setMessageHistory,
  clearMessage,
  clearError,
  setLoading,
  setError,
} = messagingSlice.actions;
export default messagingSlice.reducer;
