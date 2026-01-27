import React, { useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, DollarSign, CreditCard, Bell, Edit, MessageSquare, History, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import classNames from 'classnames';
import { PaymentStatus } from '../types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleMemberDrawer } from '@/store/slices/membersSlice';
import { is } from 'date-fns/locale';


export const MemberDetailDrawer: React.FC = () => {
  const { member, isDrawerOpen } = useAppSelector((state) => state.members);
  const dispatch = useAppDispatch();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case PaymentStatus.FAILED:
        return 'bg-red-50 text-red-600 border-red-200';
      case PaymentStatus.PENDING:
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <CheckCircle size={16} />;
      case PaymentStatus.FAILED:
        return <AlertCircle size={16} />;
      case PaymentStatus.PENDING:
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleClose = () => {
    dispatch(toggleMemberDrawer());
  };

 

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen&&(
        <div
          className={classNames ("fixed inset-0 top-0 bg-black/50 z-40 opacity-0 transition-opacity duration-300 ease-in-out ",  {'opacity-100':isDrawerOpen })}
          onClick={handleClose}
        />

      )}
  

      {/* Drawer */}
      <div
        className={classNames(
          'fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto translate-x-full',
          {
            'translate-x-0': isDrawerOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {member?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{member?.name}</h2>
                <p className="text-sm text-slate-500 mt-1">Member Profile</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className={classNames(
                'flex items-center space-x-2 px-4 py-2 rounded-xl border font-bold',
                getStatusColor(member?.status || PaymentStatus.PENDING)
              )}>
                {getStatusIcon(member?.status || PaymentStatus.PENDING)}
                <span>{member?.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                {member && (
                  <button
                    onClick={() => console.log('edit member')}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700 font-medium"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                )}
                {member && (
                  <button
                    onClick={() => console.log('send reminder')}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors text-white font-medium shadow-lg shadow-cyan-100"
                  >
                    <MessageSquare size={16} />
                    <span>Send Reminder</span>
                  </button>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <User className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-slate-800 font-semibold mt-1">{member?.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Mail className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-slate-800 font-semibold mt-1">{member?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Phone className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-slate-800 font-semibold mt-1">{member?.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Calendar className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</p>
                    <p className="text-slate-800 font-semibold mt-1">{formatDate(member?.joinedDate || '')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <DollarSign className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Due</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">₦{member?.amount.toLocaleString()}</p>
                  </div>
                </div>

                {member?.lastPaymentDate && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <CreditCard className="text-cyan-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Payment</p>
                      <p className="text-slate-800 font-semibold mt-1">{formatDate(member?.lastPaymentDate || '')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reminder History */}
            {member?.reminderHistory && member?.reminderHistory.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <Bell className="text-cyan-600" size={20} />
                    <span>Reminder History</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full">
                    {member?.reminderHistory?.length || 0} Sent
                  </span>
                </div>
                
                <div className="space-y-3">
                  {member?.reminderHistory?.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 hover:border-cyan-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{reminder.content || ''}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-slate-500 flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>{formatDate(reminder.date || '')}</span>
                            </span>
                            <span className="text-xs text-slate-500 flex items-center space-x-1">
                              <MessageSquare size={12} />
                              <span>{reminder.type || ''}</span>
                            </span>
                          </div>
                        </div>
                        <span
                          className={classNames(
                            'px-2 py-1 rounded-full text-xs font-bold',
                            reminder.status === 'Delivered' 
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-600'
                          )}
                        >
                          {reminder.status || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-xl transition-colors text-slate-700 font-medium border border-slate-200">
                  <Mail size={18} />
                  <span>Send Email</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-xl transition-colors text-slate-700 font-medium border border-slate-200">
                  <Phone size={18} />
                  <span>Call</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-xl transition-colors text-slate-700 font-medium border border-slate-200">
                  <History size={18} />
                  <span>View History</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-xl transition-colors text-slate-700 font-medium border border-slate-200">
                  <CreditCard size={18} />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
