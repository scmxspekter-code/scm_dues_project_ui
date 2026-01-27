import { useState, useEffect } from 'react';
import { analyzeDefaulterTrends } from '../services/geminiService';
import { useAuth } from './useAuth';
import { $api } from '@/api';
import { useAppDispatch } from '@/store/hooks';
import { setStats } from '@/store/slices/dashboardSlice';
import toast from 'react-hot-toast';

export interface ChartData {
  name: string;
  amount: number;
}

export interface PieData {
  name: string;
  value: number;
}

export const useDashboard = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("Analyzing current trends...");

  const dispatch = useAppDispatch();
  const [apiState,setApiState] = useState({
    stats:false,
    paymentsReport:false,
    remindersReport:false,
    messagesReport:false,
    defaultersReport:false,
  });
  const {me} = useAuth()
  useEffect(() => {
    const fetchAnalysis = async () => {
      const analysis = await analyzeDefaulterTrends(12, 120);
      setAiAnalysis(analysis);
    };
    fetchAnalysis();
  }, []);

  const chartData: ChartData[] = [
    { name: 'Jan', amount: 450000 },
    { name: 'Feb', amount: 300000 },
    { name: 'Mar', amount: 600000 },
    { name: 'Apr', amount: 200000 },
  ];

 

  const COLORS = ['#06b6d4', '#ef4444', '#f59e0b'];
  
  const getStats = async () => {
    try {
      setApiState(prev => ({...prev, stats: true}));
      const {data} = await $api.dashboard.stats();
      dispatch(setStats(data!));
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch stats');
      throw error;
    } finally {
      setApiState(prev => ({...prev, stats: false}));
    }
  }
  
  useEffect(()=>{
    getStats();
  },[]);

  return {
    aiAnalysis,
    chartData,
    COLORS,
    apiState,
  };
}
