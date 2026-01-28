import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats } from '@/types';
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
  chartData: [],
  pieData: [
    { name: 'Paid', value: 0 },
    { name: 'Defaulters', value: 0 },
    { name: 'Pending', value: 0 },
  ],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      const pieData = [
        { key: 'paid', label: 'Paid' },
        { key: 'defaulters', label: 'Defaulters' },
        { key: 'pending', label: 'Pending' },
      ].map((item) => ({
        name: item.label,
        value: getPercentage(
          action.payload.collections[item.key as keyof typeof action.payload.collections],
          action.payload.collections.total
        ),
      }));
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
