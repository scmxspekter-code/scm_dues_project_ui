import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessageLog } from '@/types';

export type RecipientType = 'defaulters' | 'paid' | 'all' | 'custom';
export type Channel = 'whatsapp' | 'sms';

interface MessagingState {
  recipientType: RecipientType;
  channel: Channel;
  message: string;
  isGenerating: boolean;
  messageHistory: MessageLog[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagingState = {
  recipientType: 'defaulters',
  channel: 'whatsapp',
  message: '',
  isGenerating: false,
  messageHistory: [],
  isLoading: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'messaging/sendMessage',
  async (payload: { recipientType: RecipientType; channel: Channel; message: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const { $api } = await import('@/api');
      // const response = await $api.messaging.send(payload);
      // return response.data;

      // Mock for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newMessage: MessageLog = {
        id: Date.now().toString(),
        recipient: payload.recipientType,
        content: payload.message,
        type: payload.channel === 'whatsapp' ? 'WhatsApp' : 'SMS',
        status: 'Sent',
        timestamp: new Date().toISOString(),
      };
      return newMessage;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchMessageHistory = createAsyncThunk(
  'messaging/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const { $api } = await import('@/api');
      // const response = await $api.messaging.getHistory();
      // return response.data;

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockHistory: MessageLog[] = [
        {
          id: '1',
          recipient: '72 members',
          content: 'Monthly Dues Reminder',
          type: 'WhatsApp',
          status: 'Delivered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          recipient: '84 members',
          content: 'Payment Confirmation',
          type: 'SMS',
          status: 'Delivered',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ];
      return mockHistory;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch message history');
    }
  }
);

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
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    clearMessage: (state) => {
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messageHistory = [action.payload, ...state.messageHistory];
        state.message = '';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessageHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messageHistory = action.payload;
      })
      .addCase(fetchMessageHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setRecipientType, setChannel, setMessage, setIsGenerating, clearMessage, clearError } = messagingSlice.actions;
export default messagingSlice.reducer;
