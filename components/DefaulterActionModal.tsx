import React, { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useDefaulters } from '@/hooks/useDefaulters';

const DURATION = 0.25;
const EASE_OUT = 'power2.out';
const EASE_IN = 'power2.in';

export const DefaulterActionModal: React.FC = () => {
  const { member, isDrawerOpen } = useAppSelector((state) => state.defaulters);
  const {
    toggleDefaulterDrawer,
    reminderHistory,
    isLoadingHistory,
    isSendingReminder,
    selectedChannel,
    setSelectedChannel,
    fetchReminderHistory,
    sendReminderToDefaulter,
  } = useDefaulters();

  const [activeTab, setActiveTab] = useState<'history' | 'message'>('history');
  const [customMsg, setCustomMsg] = useState('');
  const prevMemberIdRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Enter animation
  useEffect(() => {
    if (!isDrawerOpen) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) return;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(
      p,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: DURATION, ease: EASE_OUT }
    );
  }, [isDrawerOpen]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      toggleDefaulterDrawer();
      return;
    }
    isClosingRef.current = true;
    gsap.to(o, { opacity: 0, duration: DURATION, ease: EASE_IN });
    gsap.to(p, {
      scale: 0.95,
      opacity: 0,
      duration: DURATION,
      ease: EASE_IN,
      onComplete: () => {
        isClosingRef.current = false;
        toggleDefaulterDrawer();
      },
    });
  }, [toggleDefaulterDrawer]);

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

  // Fetch reminder history when history tab is active and member changes
  useEffect(() => {
    // Only fetch if:
    // 1. History tab is active
    // 2. Modal is open
    // 3. Member exists
    // 4. Member ID has changed (to prevent duplicate calls)
    if (
      activeTab === 'history' &&
      isDrawerOpen &&
      member?.id &&
      prevMemberIdRef.current !== member.id
    ) {
      prevMemberIdRef.current = member.id;
      fetchReminderHistory(member.id);
    }

    // Reset ref when modal closes
    if (!isDrawerOpen) {
      prevMemberIdRef.current = null;
    }
  }, [activeTab, member?.id, isDrawerOpen, fetchReminderHistory]);

  const handleSendMessage = async (): Promise<void> => {
    if (!member) return;
    try {
      await sendReminderToDefaulter(member.id, selectedChannel);
      handleClose();
    } catch {
      // Error already handled in hook
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        className="relative z-50 bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
              {member?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{member?.name}</h3>
              <p className="text-sm text-slate-500 font-medium">
                Owes ₦{member?.amount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
          >
            Reminder History
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'message' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
          >
            Send Custom Message
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'history' ? (
            <div className="space-y-6">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 italic font-medium">
                  Loading reminder history...
                </div>
              ) : reminderHistory.length > 0 ? (
                reminderHistory.map((h) => (
                  <div
                    key={h.id}
                    className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden"
                  >
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                        h.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-600'
                          : h.status === 'failed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {h.status === 'delivered' ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {h.channel} • {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            h.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-600'
                              : h.status === 'failed'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                        "{h.content}"
                      </p>
                      {h.errorMessage && (
                        <p className="text-xs text-red-500 mt-2">{h.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 italic font-medium">
                  No reminders sent yet to this member.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Delivery Channel
                </label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      selectedChannel === 'whatsapp'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedChannel('sms')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      selectedChannel === 'sms'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Message Text
                </span>
              </div>
              <textarea
                rows={8}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Write your custom reminder here..."
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 font-medium text-slate-700 resize-none transition-all"
              />
              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">
                  Message will be sent to {member?.phoneNumber} via {selectedChannel.toUpperCase()}{' '}
                  as primary channel.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all"
          >
            Cancel
          </button>
          {activeTab === 'message' && (
            <button
              onClick={handleSendMessage}
              disabled={isSendingReminder || !member}
              className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              <span>{isSendingReminder ? 'Sending...' : 'Send Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
