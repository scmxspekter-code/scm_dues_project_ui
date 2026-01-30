import React, { useEffect, useState, useCallback, useRef } from 'react';
import gsap from 'gsap';
import {
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Bell,
  MessageSquare,
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  Link2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import classNames from 'classnames';
import { PaymentStatus, MessageLog, PaymentRecord, Member } from '../types';
import { useMembers } from '@/hooks/useMembers';
import { CustomSelect } from './CustomSelect';
import toast from 'react-hot-toast';
import { is } from 'date-fns/locale';

interface MemberDetailDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  member,
  isOpen: isDrawerOpen,
  onClose: closeDetailDrawer,
}) => {
  const {
    sendReminder,
    getReminderHistory,
    markAsPaid,
    getCollectionPayments,
    getPaymentLink,
    createPaymentLink,
  } = useMembers();
  const [reminderHistory, setReminderHistory] = useState<MessageLog[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isLoadingPaymentLink, setIsLoadingPaymentLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [activeTab, setActiveTab] = useState<'reminders' | 'payments'>('reminders');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  const DURATION = 0.25;
  const EASE_OUT = 'power2.out';
  const EASE_IN = 'power2.in';

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

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async (): Promise<void> => {
    if (!member?.id) return;
    setIsLoadingPayments(true);
    try {
      const payments = await getCollectionPayments(member.id);
      setPaymentHistory(payments);
    } catch {
      setPaymentHistory([]);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [member?.id, getCollectionPayments]);

  // Fetch payment link
  const fetchPaymentLink = useCallback(async (): Promise<void> => {
    if (!member?.id) return;
    setIsLoadingPaymentLink(true);
    try {
      const link = await getPaymentLink(member.id);
      if (link?.linkUrl) {
        setPaymentLink(link.linkUrl);
      } else {
        // Try to create one if it doesn't exist
        const newLink = await createPaymentLink(member.id);
        if (newLink?.linkUrl) {
          setPaymentLink(newLink.linkUrl);
        }
      }
    } catch {
      setPaymentLink(null);
    } finally {
      setIsLoadingPaymentLink(false);
    }
  }, [member?.id, getPaymentLink, createPaymentLink]);

  useEffect(() => {
    if (isDrawerOpen && member?.id) {
      fetchReminderHistory();
      fetchPaymentHistory();
      fetchPaymentLink();
    } else {
      // Clear history when drawer closes
      setReminderHistory([]);
      setPaymentHistory([]);
      setPaymentLink(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, member?.id]);

  const handleCopyPaymentLink = async (): Promise<void> => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success('Payment link copied to clipboard');
    } catch {
      toast.error('Failed to copy payment link');
    }
  };

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

  // Set closed state when drawer is closed
  useEffect(() => {
    if (!isDrawerOpen && overlayRef.current && panelRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(panelRef.current, { x: '100%' });
    }
  }, [isDrawerOpen]);

  // Enter animation when drawer opens
  useEffect(() => {
    if (!isDrawerOpen || !overlayRef.current || !panelRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(p, { x: '100%' }, { x: 0, duration: DURATION, ease: EASE_OUT });
  }, [isDrawerOpen]);

  const handleClose = useCallback((): void => {
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      closeDetailDrawer();
      return;
    }
    isClosingRef.current = true;
    gsap.to(o, { opacity: 0, duration: DURATION, ease: EASE_IN });
    gsap.to(p, {
      x: '100%',
      duration: DURATION,
      ease: EASE_IN,
      onComplete: () => {
        isClosingRef.current = false;
        closeDetailDrawer();
      },
    });
  }, [closeDetailDrawer]);

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
      handleClose();
    } catch {
      // Error already handled in hook
    }
  };

  if (!member) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={classNames('fixed inset-0 bg-black/50 z-40', {
          'pointer-events-auto': isDrawerOpen,
          'pointer-events-none': !isDrawerOpen,
        })}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        className={classNames(
          'fixed inset-y-0 right-0 h-full w-full bg-white shadow-2xl z-50 overflow-hidden sm:max-w-md lg:max-w-lg xl:max-w-xl',
          {
            'pointer-events-auto': isDrawerOpen,
            'pointer-events-none': !isDrawerOpen,
          }
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-drawer-title"
        aria-hidden={!isDrawerOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header - Responsive */}
          <div className="shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-linear-to-r from-cyan-50 to-blue-50">
            <div className="grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Mobile back button */}
              <button
                onClick={handleClose}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700 shrink-0"
                aria-label="Close drawer"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Avatar */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>

              {/* Name and subtitle */}
              <div className="min-w-0 flex-1">
                <h2
                  id="member-drawer-title"
                  className="text-sm font-bold text-slate-800 truncate"
                >
                  {member.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Member Profile</p>
              </div>
            </div>

            {/* Desktop close button */}
            <button
              onClick={handleClose}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-700 shrink-0"
              aria-label="Close drawer"
            >
              <X size={16} />
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
                      'flex  items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border font-bold text-sm w-full sm:w-auto',
                      getStatusColor(member.paymentStatus || PaymentStatus.PENDING)
                    )}
                  >
                    {getStatusIcon(member.paymentStatus || PaymentStatus.PENDING)}
                    <span className="capitalize">{member.paymentStatus}</span>
                  </div>
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
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg sm:rounded-xl transition-colors text-white font-medium shadow-lg shadow-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                <h3 className="text-sm font-bold text-slate-800">Basic Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <User className="text-cyan-600" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </p>
                      <p className="text-sm text-slate-800 font-semibold mt-1 wrap-break-words">
                        {member.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <Phone className="text-cyan-600" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Phone
                      </p>
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="text-sm text-slate-800 font-semibold mt-1 hover:text-cyan-600 transition-colors break-all"
                      >
                        {member.phoneNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <Calendar className="text-cyan-600" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Due Date
                      </p>
                      <p className="text-sm text-slate-800 font-semibold mt-1">
                        {formatDate(member.dueDate)}
                      </p>
                    </div>
                  </div>

                  {member.dob && (
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white rounded-lg shrink-0">
                        <Calendar className="text-cyan-600" size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Date of Birth
                        </p>
                        <p className="text-sm text-slate-800 font-semibold mt-1">
                          {formatDate(member.dob)}
                        </p>
                      </div>
                    </div>
                  )}

                  {member.anniversary && (
                    <div className="flex items-start space-x-3 sm:col-span-2">
                      <div className="p-2 bg-white rounded-lg shrink-0">
                        <Calendar className="text-cyan-600" size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Anniversary
                        </p>
                        <p className="text-sm text-slate-800 font-semibold mt-1">
                          {formatDate(member.anniversary)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <DollarSign className="text-cyan-600" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Amount Due
                      </p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        ₦{member.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <Bell className="text-cyan-600" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Reminder Frequency
                      </p>
                      <p className="text-sm text-slate-800 font-semibold mt-1 capitalize">
                        {member.reminderFrequency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Link Section */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                      <Link2 size={16} className="text-cyan-600" />
                      <span>Payment Link</span>
                    </h4>
                    {!paymentLink && (
                      <button
                        onClick={fetchPaymentLink}
                        disabled={isLoadingPaymentLink}
                        className="text-xs font-medium text-cyan-600 hover:text-cyan-700 disabled:opacity-50"
                      >
                        {isLoadingPaymentLink ? 'Creating...' : 'Create Link'}
                      </button>
                    )}
                  </div>
                  {isLoadingPaymentLink ? (
                    <div className="py-4 text-center text-slate-400 italic text-sm">
                      Loading payment link...
                    </div>
                  ) : paymentLink ? (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            readOnly
                            value={paymentLink}
                            className="flex-1 text-xs sm:text-sm font-mono text-slate-700 bg-transparent border-none outline-none truncate"
                          />
                          <button
                            onClick={handleCopyPaymentLink}
                            className="p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors shrink-0"
                            title="Copy link"
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                            title="Open link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Status: Active</span>
                          <span>•</span>
                          <span>Payments: {paymentHistory.filter((p) => p.status === 'successful').length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-400 italic text-sm">
                      No payment link available. Click "Create Link" to generate one.
                    </div>
                  )}
                </div>
              </div>

              {/* History Section with Tabs */}
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <History className="text-cyan-600" size={16} />
                    <span>History</span>
                  </h3>
                  {/* Tab Switcher */}
                  <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                    <button
                      onClick={() => setActiveTab('reminders')}
                      className={classNames(
                        'px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors',
                        activeTab === 'reminders'
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-600 hover:text-slate-800'
                      )}
                    >
                      Reminders
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={classNames(
                        'px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors',
                        activeTab === 'payments'
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-600 hover:text-slate-800'
                      )}
                    >
                      Payments
                    </button>
                  </div>
                </div>

                {/* Reminder History Tab */}
                {activeTab === 'reminders' && (
                  <>
                    {isLoadingHistory ? (
                      <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
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
                                <p className="text-sm text-slate-800 font-medium wrap-break-words">
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
                                  <p className="text-[10px] sm:text-xs text-red-500 mt-2 wrap-break-words">
                                    {reminder.errorMessage}
                                  </p>
                                )}
                              </div>
                              <span
                                className={classNames(
                                  'px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold capitalize whitespace-nowrap shrink-0',
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
                      <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
                        No reminders sent yet. Send a reminder to see history here.
                      </div>
                    )}
                  </>
                )}

                {/* Payment History Tab */}
                {activeTab === 'payments' && (
                  <>
                    {isLoadingPayments ? (
                      <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
                        Loading payment history...
                      </div>
                    ) : paymentHistory.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {paymentHistory.map((payment) => (
                          <div
                            key={payment.id}
                            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-cyan-200 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm text-slate-800 font-bold">
                                    ₦{payment.amount.toLocaleString()}
                                  </p>
                                  <span
                                    className={classNames(
                                      'px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold capitalize whitespace-nowrap shrink-0',
                                      payment.status === 'successful'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : payment.status === 'failed'
                                          ? 'bg-red-50 text-red-600'
                                          : 'bg-amber-50 text-amber-600'
                                    )}
                                  >
                                    {payment.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                                  <span className="text-[10px] sm:text-xs text-slate-500">
                                    <span className="font-medium">Provider:</span> {payment.provider}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-slate-500">
                                    <span className="font-medium">Method:</span> {payment.paymentMethod}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-slate-500 flex items-center space-x-1">
                                    <Calendar size={12} />
                                    <span>{formatDate(payment.paymentDate || payment.createdAt)}</span>
                                  </span>
                                </div>
                                {payment.payerName && (
                                  <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                                    <span className="font-medium">Payer:</span> {payment.payerName}
                                  </p>
                                )}
                                {payment.fee > 0 && (
                                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                                    <span className="font-medium">Fee:</span> ₦{payment.fee.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
                        No payment history available yet.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-linear-to-r from-cyan-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      if (activeTab === 'reminders') {
                        fetchReminderHistory();
                      } else {
                        fetchPaymentHistory();
                      }
                    }}
                    className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-slate-700 font-medium border border-slate-200 text-sm"
                  >
                    <History size={16} />
                    <span>Refresh History</span>
                  </button>
                  <button
                    onClick={handleMarkAsPaid}
                    className="flex items-center justify-center space-x-2 p-3 bg-white hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-slate-700 font-medium border border-slate-200 text-sm"
                  >
                    <CreditCard size={16} />
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
