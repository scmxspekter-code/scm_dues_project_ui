import React from 'react';
import { User, Bell, Shield, Database, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-2xl">
            {(user?.firstname?.charAt(0) || user?.lastname?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {user?.firstname && user?.lastname
                ? `${user.firstname} ${user.lastname}`
                : user?.firstname || user?.lastname || 'User'}
            </h3>
            <p className="text-sm text-slate-500">{user?.email || 'No email'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <User className="text-cyan-600" size={20} />
              <div>
                <p className="font-bold text-slate-800">Profile Information</p>
                <p className="text-xs text-slate-500">View and edit your profile</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Bell className="text-cyan-600" size={20} />
              <div>
                <p className="font-bold text-slate-800">Notifications</p>
                <p className="text-xs text-slate-500">Manage notification preferences</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Shield className="text-cyan-600" size={20} />
              <div>
                <p className="font-bold text-slate-800">Security</p>
                <p className="text-xs text-slate-500">Password and security settings</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Database className="text-cyan-600" size={20} />
              <div>
                <p className="font-bold text-slate-800">Data Management</p>
                <p className="text-xs text-slate-500">Backup and data export</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h4 className="font-bold text-red-600 mb-4">Danger Zone</h4>
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
          <div>
            <p className="font-bold text-red-800">Logout</p>
            <p className="text-xs text-red-600">Sign out of your account</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
