import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyzeDefaulterTrends } from '@/services/geminiService';
import { CollectionsStats, DashboardStats } from '@/types';
import { getPercentage } from '@/utils';

export interface ChartData {
  name: string;
  amount: number;
}

export interface PieData {
  name: string;
  value: number;
}

interface DashboardState {
  stats: DashboardStats;
  aiAnalysis: string;
  chartData: ChartData[];
  pieData: PieData[];
}

const initialState: DashboardState = {
  stats: {
    collections: {
      total: 0,
      paid: 0,
      pending: 0,
      failed: 0,
      defaulters: 0,
      totalAmountCollected: 0,
      totalAmountPending: 0,
      totalAmountFailed: 0,
    },
    recentPayments: [],
    recentReminders: [],
    messageDeliveryRates: {
      sent: 0,
      delivered: 0,
      failed: 0,
      total: 0,
    },
  },
  aiAnalysis: 'Analyzing current trends...',
  chartData: [
    { name: 'Jan', amount: 450000 },
    { name: 'Feb', amount: 300000 },
    { name: 'Mar', amount: 600000 },
    { name: 'Apr', amount: 200000 },
  ],
  pieData: [
    { name: 'Paid', value: 0 },
    { name: 'Defaulters', value: 0 },
    { name: 'Pending', value: 0 },
  ],

};

export const fetchAIAnalysis = createAsyncThunk(
  'dashboard/fetchAIAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const analysis = await analyzeDefaulterTrends(12, 120);
      return analysis;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch AI analysis');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      const pieData = [
        { key: "paid", label: "Paid" },
        { key: "defaulters", label: "Defaulters" },
        { key: "pending", label: "Pending" },
      ].map(item => ({
        name: item.label,
        value: getPercentage(action.payload.collections[item.key as keyof typeof action.payload.collections], action.payload.collections.total),
      }))
      state.pieData = pieData;
      state.stats = action.payload;
    },
    setChartData: (state, action: PayloadAction<ChartData[]>) => {
      state.chartData = action.payload;
    },
 
  
  },

});

export const { setStats, setChartData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
