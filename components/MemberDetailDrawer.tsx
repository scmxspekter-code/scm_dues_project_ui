import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Bell,
  Edit,
  MessageSquare,
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import classNames from 'classnames';
import { PaymentStatus, MessageLog } from '../types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleMemberDrawer } from '@/store/slices/membersSlice';
import { useMembers } from '@/hooks/useMembers';
import { CustomSelect } from './CustomSelect';

export const MemberDetailDrawer: React.FC = () => {
  const { member, isDrawerOpen } = useAppSelector((state) => state.members);
  const dispatch = useAppDispatch();
  const { sendReminder, getReminderHistory, markAsPaid } = useMembers();
  const [reminderHistory, setReminderHistory] = useState<MessageLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp'>('whatsapp');

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

  // Fetch reminder history when drawer opens
  const fetchReminderHistory = useCallback(async (): Promise<void> => {
    if (!member?.id) return;
    setIsLoadingHistory(true);
    try {
      const history = await getReminderHistory(member.id, { page: 1, limit: 10 });
      setReminderHistory(history);
    } catch {
      setReminderHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [member?.id, getReminderHistory]);

  useEffect(() => {
    if (isDrawerOpen && member?.id) {
      fetchReminderHistory();
    } else {
      // Clear history when drawer closes
      setReminderHistory([]);
    }
  }, [isDrawerOpen, member?.id, fetchReminderHistory]);

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

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleClose = (): void => {
    dispatch(toggleMemberDrawer());
  };

  const handleSendReminder = async (): Promise<void> => {
    if (!member) return;
    setIsSending(true);
    try {
      await sendReminder(member.id, selectedChannel);
      // Refresh reminder history to show the newly sent reminder
      await fetchReminderHistory();
    } catch {
      // Error already handled in hook
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = async (): Promise<void> => {
    if (!member) return;
    try {
      await markAsPaid(member.id);
      dispatch(toggleMemberDrawer());
    } catch {
      // Error already handled in hook
    }
  };

  if (!member) return null;

  return (
    <>
      {/* Backdrop - Always rendered for smooth animation */}
      <div
        className={classNames(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out',
          {
            'opacity-100 pointer-events-auto': isDrawerOpen,
            'opacity-0 pointer-events-none': !isDrawerOpen,
          }
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer - Always rendered for smooth animation */}
      <div
        className={classNames(
          'fixed inset-y-0 right-0 h-full w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden',
          'sm:max-w-md lg:max-w-lg xl:max-w-xl',
          {
            'translate-x-0': isDrawerOpen,
            'translate-x-full': !isDrawerOpen,
          }
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-drawer-title"
        aria-hidden={!isDrawerOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header - Responsive */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="grid grid-cols-4items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              {/* Mobile back button */}
              <button
                onClick={handleClose}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700 flex-shrink-0"
                aria-label="Close drawer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg flex-shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>

              {/* Name and subtitle */}
              <div className="min-w-0 flex-1">
                <h2
                  id="member-drawer-title"
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate"
                >
                  {member.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Member Profile</p>
              </div>
            </div>

            {/* Desktop close button */}
            <button
              onClick={handleClose}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700 flex-shrink-0"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status Badge and Actions - Responsive */}
              <div className="flex   sm:items-center  gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <div
                    className={classNames(
                      'flex  items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border font-bold text-sm sm:text-base w-full sm:w-auto',
                      getStatusColor(member.paymentStatus || PaymentStatus.PENDING)
                    )}
                  >
                    {getStatusIcon(member.paymentStatus || PaymentStatus.PENDING)}
                    <span className="capitalize">{member.paymentStatus}</span>
                  </div>
                  {/* Edit Button - Hidden on mobile, shown on desktop */}
                  <button
                    onClick={() => {
                      // TODO: Implement edit member functionality
                    }}
                    className="hidden sm:flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors text-slate-700 font-medium text-sm sm:text-base"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                </div>
                {/* Action Buttons - Stack on mobile, horizontal on desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                  {/* Send Reminder - Full width on mobile */}
                  <div className="grid items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none min-w-[140px]">
                      <CustomSelect
                        value={selectedChannel}
                        onChange={(value) => setSelectedChannel(value as 'sms' | 'whatsapp')}
                        options={[
                          { value: 'whatsapp', label: 'WhatsApp' },
                          { value: 'sms', label: 'SMS' },
                        ]}
                        size="sm"
                        className="bg-white border-slate-200"
                        containerClassName="space-y-0"
                      />
                    </div>
                    <button
                      onClick={handleSendReminder}
                      disabled={isSending}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg sm:rounded-xl transition-colors text-white font-medium shadow-lg shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <MessageSquare size={16} />
                      <span className="whitespace-nowrap">
                        {isSending ? 'Sending...' : 'Send Reminder'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Basic Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0">
                      <User className="text-cyan-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </p>
                      <p className="text-sm sm:text-base text-slate-800 font-semibold mt-1 break-words">
                        {member.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0">
                      <Phone className="text-cyan-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Phone
                      </p>
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="text-sm sm:text-base text-slate-800 font-semibold mt-1 hover:text-cyan-600 transition-colors break-all"
                      >
                        {member.phoneNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0">
                      <Calendar className="text-cyan-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Due Date
                      </p>
                      <p className="text-sm sm:text-base text-slate-800 font-semibold mt-1">
                        {formatDate(member.dueDate)}
                      </p>
                    </div>
                  </div>

                  {member.dob && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white rounded-lg flex-shrink-0">
                        <Calendar className="text-cyan-600" size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Date of Birth
                        </p>
                        <p className="text-sm sm:text-base text-slate-800 font-semibold mt-1">
                          {formatDate(member.dob)}
                        </p>
                      </div>
                    </div>
                  )}

                  {member.anniversary && (
                    <div className="flex items-start space-x-3 sm:col-span-2">
                      <div className="p-2 bg-white rounded-lg flex-shrink-0">
                        <Calendar className="text-cyan-600" size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Anniversary
                        </p>
                        <p className="text-sm sm:text-base text-slate-800 font-semibold mt-1">
                          {formatDate(member.anniversary)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0">
                      <DollarSign className="text-cyan-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Amount Due
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                        ₦{member.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg flex-shrink-0">
                      <Bell className="text-cyan-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Reminder Frequency
                      </p>
                      <p className="text-sm sm:text-base text-slate-800 font-semibold mt-1 capitalize">
                        {member.reminderFrequency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reminder History */}
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <Bell className="text-cyan-600" size={18} />
                    <span>Reminder History</span>
                  </h3>
                  {reminderHistory.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-white px-2 sm:px-3 py-1 rounded-full w-fit">
                      {reminderHistory.length} Sent
                    </span>
                  )}
                </div>

                {isLoadingHistory ? (
                  <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base">
                    Loading reminder history...
                  </div>
                ) : reminderHistory.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {reminderHistory.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-cyan-200 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-slate-800 font-medium break-words">
                              {reminder.content}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                              <span className="text-[10px] sm:text-xs text-slate-500 flex items-center space-x-1">
                                <Calendar size={12} />
                                <span>{formatDate(reminder.createdAt)}</span>
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-500 flex items-center space-x-1">
                                <MessageSquare size={12} />
                                <span className="capitalize">{reminder.channel}</span>
                              </span>
                            </div>
                            {reminder.errorMessage && (
                              <p className="text-[10px] sm:text-xs text-red-500 mt-2 break-words">
                                {reminder.errorMessage}
                              </p>
                            )}
                          </div>
                          <span
                            className={classNames(
                              'px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold capitalize whitespace-nowrap flex-shrink-0',
                              reminder.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-600'
                                : reminder.status === 'failed'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-amber-50 text-amber-600'
                            )}
                          >
                            {reminder.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base">
                    No reminders sent yet. Send a reminder to see history here.
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={fetchReminderHistory}
                    className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-slate-700 font-medium border border-slate-200 text-sm sm:text-base"
                  >
                    <History size={18} />
                    <span>Refresh History</span>
                  </button>
                  <button
                    onClick={handleMarkAsPaid}
                    className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-slate-700 font-medium border border-slate-200 text-sm sm:text-base"
                  >
                    <CreditCard size={18} />
                    <span>Mark as Paid</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
