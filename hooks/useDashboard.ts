import { useState, useEffect } from 'react';
import { $api } from '@/api';
import { useAppDispatch } from '@/store/hooks';
import { setStats, setChartData, ChartData } from '@/store/slices/dashboardSlice';
import toast from 'react-hot-toast';
import {
  isApiError,
  CollectionsStats,
  PaymentsReportParams,
  RemindersReportParams,
  MessagesReportParams,
  Member,
} from '@/types';

export interface PieData {
  name: string;
  value: number;
}

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const [apiState, setApiState] = useState({
    stats: false,
    collectionStats: false,
    paymentsReport: false,
    remindersReport: false,
    messagesReport: false,
    defaultersReport: false,
  });

  const COLORS = ['#06b6d4', '#ef4444', '#f59e0b'];

  const getStats = async (): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, stats: true }));
      const { data } = await $api.dashboard.stats();
      dispatch(setStats(data!));
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch stats');
      } else {
        toast.error('Failed to fetch stats');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, stats: false }));
    }
  };

  const getCollectionStats = async (): Promise<CollectionsStats | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, collectionStats: true }));
      const { data } = await $api.members.getCollectionStats();
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch collection stats');
      } else {
        toast.error('Failed to fetch collection stats');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, collectionStats: false }));
    }
  };

  const getPaymentsReport = async (params: PaymentsReportParams): Promise<Blob> => {
    try {
      setApiState((prev) => ({ ...prev, paymentsReport: true }));
      const blob = await $api.exports.exportPayments(params);
      return blob;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch payments report');
      } else {
        toast.error('Failed to fetch payments report');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, paymentsReport: false }));
    }
  };

  const getChartData = async (period: '6months' | 'year' = '6months'): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, paymentsReport: true }));

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (period === '6months') {
        startDate.setMonth(startDate.getMonth() - 6);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      // Fetch payments report data - returns Member[] with payment status
      const response = await $api.dashboard.paymentsReport({
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        limit: 1000, // Get enough data to aggregate
      });

      if (!response.data || response.data.length === 0) {
        // Generate empty chart data for the period if no data
        const chartData: ChartData[] = [];
        const months = period === '6months' ? 6 : 12;
        for (let i = months - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          chartData.push({
            name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            amount: 0,
          });
        }
        dispatch(setChartData(chartData));
        return;
      }

      // Group members by month based on updatedAt (when payment was made)
      // For paid members, use updatedAt as payment date
      const members = response.data;
      const monthlyData: Record<string, number> = {};

      // Initialize all months in the period with 0
      const months = period === '6months' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = 0;
      }

      // Aggregate amounts by month
      members.forEach((member: Member) => {
        // Use updatedAt as payment date for paid members
        const paymentDate = new Date(member.updatedAt);
        const monthKey = paymentDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        // Only count if within our period and member is paid
        if (paymentDate >= startDate && paymentDate <= endDate && member.paymentStatus === 'paid') {
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += member.amount;
        }
      });

      // Convert to ChartData format and sort by date
      const chartData: ChartData[] = Object.entries(monthlyData)
        .map(([name, amount]) => ({
          name,
          amount: Math.round(amount),
        }))
        .sort((a, b) => {
          // Parse month names to dates for proper sorting
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA.getTime() - dateB.getTime();
        });

      dispatch(setChartData(chartData));
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch chart data');
      } else {
        toast.error('Failed to fetch chart data');
      }
      // Set empty chart data on error
      const chartData: ChartData[] = [];
      const months = period === '6months' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        chartData.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: 0,
        });
      }
      dispatch(setChartData(chartData));
    } finally {
      setApiState((prev) => ({ ...prev, paymentsReport: false }));
    }
  };

  const getRemindersReport = async (params: RemindersReportParams): Promise<Blob> => {
    try {
      setApiState((prev) => ({ ...prev, remindersReport: true }));
      const blob = await $api.exports.exportMessages(params);
      return blob;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch reminders report');
      } else {
        toast.error('Failed to fetch reminders report');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, remindersReport: false }));
    }
  };

  const getMessagesReport = async (params: MessagesReportParams): Promise<Blob> => {
    try {
      setApiState((prev) => ({ ...prev, messagesReport: true }));
      const blob = await $api.exports.exportMessages(params);
      return blob;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch messages report');
      } else {
        toast.error('Failed to fetch messages report');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, messagesReport: false }));
    }
  };

  useEffect(() => {
    getStats();
    getChartData('6months'); // Load initial chart data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    COLORS,
    apiState,
    getStats,
    getCollectionStats,
    getPaymentsReport,
    getRemindersReport,
    getMessagesReport,
    getChartData,
  };
};
