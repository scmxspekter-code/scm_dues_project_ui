
import React from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = React.useState('admin@scm.ng');
  const [password, setPassword] = React.useState('••••••••');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-100 via-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sperktar Admin</h1>
          <p className="text-slate-500 mt-2 font-medium">SCM Nigeria Dues Management Portal</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="admin@scm.ng"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-cyan-700 active:scale-[0.98] transition-all shadow-lg shadow-cyan-200 disabled:opacity-70"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Need access? <a href="#" className="text-cyan-600 font-bold hover:underline">Contact SCM Support</a>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          &copy; 2025 Sperktar Automated Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
};
