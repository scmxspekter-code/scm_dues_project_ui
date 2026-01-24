
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
  Cell
} from 'recharts';
// Fix: Merged CreditCard into the main lucide-react import list
import { TrendingUp, Users, AlertCircle, CheckCircle, BrainCircuit, CreditCard } from 'lucide-react';
import { analyzeDefaulterTrends } from '../services/geminiService';

const data = [
  { name: 'Jan', amount: 450000 },
  { name: 'Feb', amount: 300000 },
  { name: 'Mar', amount: 600000 },
  { name: 'Apr', amount: 200000 },
];

const COLORS = ['#06b6d4', '#ef4444', '#f59e0b'];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
  </div>
);

export const Dashboard: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = React.useState<string>("Analyzing current trends...");

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      const analysis = await analyzeDefaulterTrends(12, 120);
      setAiAnalysis(analysis);
    };
    fetchAnalysis();
  }, []);

  const pieData = [
    { name: 'Paid', value: 88 },
    { name: 'Defaulters', value: 12 },
    { name: 'Pending', value: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-cyan-100 flex items-start space-x-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <BrainCircuit size={28} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1 flex items-center">
            AI Collection Insight
            <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase tracking-tighter font-normal">Gemini 3 Powered</span>
          </h4>
          <p className="text-cyan-50 text-sm leading-relaxed max-w-3xl">
            {aiAnalysis}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="₦2.4M" 
          icon={<CreditCard className="text-cyan-600" />} 
          color="bg-cyan-50"
          trend="+12%"
        />
        <StatCard 
          title="Total Members" 
          value="156" 
          icon={<Users className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Paid (2025)" 
          value="84" 
          icon={<CheckCircle className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Defaulters" 
          value="72" 
          icon={<AlertCircle className="text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-slate-800">Dues Collection Trend</h4>
            <select className="bg-slate-50 border-none text-sm font-medium text-slate-500 rounded-lg px-3 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h4 className="font-bold text-slate-800 mb-4">Status Breakdown</h4>
          <div className="flex-1 relative">
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
              <span className="text-2xl font-bold text-slate-800">156</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-slate-500">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
