import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, AlertCircle, CheckCircle, CreditCard, FileText } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAppSelector } from '@/store/hooks';
import { StatCardSkeleton, ChartSkeleton, PieChartSkeleton } from '../components/Skeleton';
import { CustomSelect } from '../components/CustomSelect';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      {trend && (
        <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-bold">{title}</p>
    <h3 className="text-sm font-bold text-slate-800 mt-1">{value}</h3>
  </div>
);

export const Dashboard: React.FC = () => {
  const {
    COLORS,
    apiState,
    selectedPeriod,
    handlePeriodChange,
    isExportingReport,
    handleExportReport,
  } = useDashboard();
  const { stats, pieData, chartData } = useAppSelector((state) => state.dashboard);
  const isLoading = apiState.stats;
  const isLoadingChart = apiState.paymentsReport;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={`₦${stats.collections.totalAmountCollected.toLocaleString()}`}
              icon={<CreditCard className="text-cyan-600" />}
              color="bg-cyan-50"
              trend="+12%"
            />
            <StatCard
              title="Total Members"
              value={stats.collections.total.toString()}
              icon={<Users className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title={`Paid (${new Date().getFullYear()})`}
              value={stats.collections.paid.toString()}
              icon={<CheckCircle className="text-emerald-600" />}
              color="bg-emerald-50"
            />
            <StatCard
              title="Defaulters"
              value={stats.collections.defaulters.toString()}
              icon={<AlertCircle className="text-red-600" />}
              color="bg-red-50"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection Chart */}
        {isLoading || isLoadingChart ? (
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-800 text-sm">Dues Collection Trend</h4>
              <CustomSelect
                value={selectedPeriod}
                onChange={(value) => handlePeriodChange(value as '6months' | 'year')}
                options={[
                  { value: '6months', label: 'Last 6 Months' },
                  { value: 'year', label: 'Last Year' },
                ]}
                size="md"
                className="min-w-[160px] bg-slate-50 border-slate-200 rounded-lg text-sm font-bold"
                containerClassName="mb-0"
              />
            </div>
            {chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [
                        `₦${value.toLocaleString()}`,
                        'Amount Collected',
                      ]}
                    />
                    <Bar dataKey="amount" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <p className="text-sm font-medium">No collection data available</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Data will appear here once payments are recorded
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Breakdown Chart */}
        {isLoading ? (
          <PieChartSkeleton />
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h4 className="font-bold text-slate-800 text-sm mb-4">Status Breakdown</h4>
            <div className="flex-1 relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-bold text-slate-800">{stats.collections.total}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    ></div>
                    <span className="text-slate-500">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-slate-800 text-sm flex items-center">
            <FileText className="mr-2 text-cyan-600" size={16} />
            Reports
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExportReport('payments')}
            disabled={isExportingReport === 'payments'}
            className="p-4 rounded-lg border border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-2">
              <CreditCard size={16} className="text-cyan-600" />
              {isExportingReport === 'payments' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-600 border-t-transparent" />
              )}
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Payments Report</h5>
            <p className="text-xs text-slate-500 mt-1">Export payment records</p>
          </button>

          <button
            onClick={() => handleExportReport('reminders')}
            disabled={isExportingReport === 'reminders'}
            className="p-4 rounded-lg border border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={16} className="text-amber-600" />
              {isExportingReport === 'reminders' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-600 border-t-transparent" />
              )}
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Reminders Report</h5>
            <p className="text-xs text-slate-500 mt-1">Export reminder history</p>
          </button>

          <button
            onClick={() => handleExportReport('messages')}
            disabled={isExportingReport === 'messages'}
            className="p-4 rounded-lg border border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText size={16} className="text-blue-600" />
              {isExportingReport === 'messages' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-600 border-t-transparent" />
              )}
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Messages Report</h5>
            <p className="text-xs text-slate-500 mt-1">Export message logs</p>
          </button>

          <button
            onClick={() => handleExportReport('defaulters')}
            disabled={isExportingReport === 'defaulters'}
            className="p-4 rounded-lg border border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between mb-2">
              <Users size={16} className="text-red-600" />
              {isExportingReport === 'defaulters' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-600 border-t-transparent" />
              )}
            </div>
            <h5 className="font-bold text-slate-800 text-sm">Defaulters Report</h5>
            <p className="text-xs text-slate-500 mt-1">Export defaulters list</p>
          </button>
        </div>
      </div>
    </div>
  );
};
