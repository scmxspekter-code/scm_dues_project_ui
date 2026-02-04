import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  LogOut,
  Bell,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import classNames from 'classnames';

const SidebarItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200'
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/members', icon: <Users size={16} />, label: 'Members' },
    { to: '/defaulters', icon: <AlertTriangle size={16} />, label: 'Defaulters' },
    { to: '/payments', icon: <CreditCard size={16} />, label: 'Payments' },
    { to: '/messaging', icon: <MessageSquare size={16} />, label: 'Messaging' },
    { to: '/celebrations', icon: <Bell size={16} />, label: 'Celebrations' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Menu Button */}

      {/* {overlay} */}
      {isOpen && (
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className={classNames(
            'fixed inset-0 top-0 bg-black/50 z-10 opacity-0 transition-opacity duration-300 ease-out',
            {
              'opacity-100': isOpen,
            }
          )}
        ></div>
      )}
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0  w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0 z-10' : '-translate-x-full z-0'}
      `}
      >
        <div className="h-full flex flex-col px-2 md:px-6 py-8">
          <div className="flex items-center justify-between  mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-800">Sperktar</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                  SCM Admin
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen((prev) => !prev)} className="p-2 t relative lg:hidden">
              <X
                className="ext-slate-800 hover:text-cyan-500 transition-colors"
                strokeWidth={3}
                size={16}
              />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-6">
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 h-screen overflow-hidden w-full">
        <header className="h-14 sm:h-16 lg:h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-slate-800 truncate mr-2">
            {menuItems.find((i) => i.to === location.pathname)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="p-2 text-slate-400 hover:text-cyan-500 transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-slate-100 ring-offset-2">
              <img src="https://picsum.photos/seed/admin/100" alt="Admin" />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden  bg-cyan-600 text-white p-2 rounded-full shadow-2xl"
            >
              <Menu />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-0">
          {children}
        </section>
      </main>
    </div>
  );
};
