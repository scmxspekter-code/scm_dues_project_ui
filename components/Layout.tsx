
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAppDispatch,useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth); 

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/members', icon: <Users size={20} />, label: 'Members' },
    { to: '/defaulters', icon: <AlertTriangle size={20} />, label: 'Defaulters' },
    { to: '/payments', icon: <CreditCard size={20} />, label: 'Payments' },
    { to: '/messaging', icon: <MessageSquare size={20} />, label: 'Messaging' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-cyan-600 text-white p-4 rounded-full shadow-2xl"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-6 py-8">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">Sperktar</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">SCM Admin</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-6">
            <button 
              onClick={()=>dispatch(logout())}
              className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors w-full text-left"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {menuItems.find(i => i.to === location.pathname)?.label || 'Overview'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-cyan-500 transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-slate-100 ring-offset-2">
              <img src="https://picsum.photos/seed/admin/100" alt="Admin" />  
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </section>
      </main>
    </div>
  );
};
