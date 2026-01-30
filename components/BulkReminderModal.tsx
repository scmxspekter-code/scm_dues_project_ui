import React, { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, MessageSquare, Smartphone } from 'lucide-react';
import classNames from 'classnames';

interface BulkReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (channel: 'sms' | 'whatsapp') => Promise<void>;
  isSending: boolean;
}

const DURATION = 0.25;
const EASE_OUT = 'power2.out';
const EASE_IN = 'power2.in';

export const BulkReminderModal: React.FC<BulkReminderModalProps> = ({
  isOpen,
  onClose,
  onSend,
  isSending,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) return;
    gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: DURATION, ease: EASE_OUT });
    gsap.fromTo(p, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: DURATION, ease: EASE_OUT });
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    const o = overlayRef.current;
    const p = panelRef.current;
    if (!o || !p) {
      onClose();
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
        onClose();
      },
    });
  }, [onClose]);

  const handleSend = async (): Promise<void> => {
    await onSend(selectedChannel);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50 pointer-events-auto"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={panelRef}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Send Bulk Reminders</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Send reminders to all defaulters via your chosen channel
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Channel Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700">Select Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedChannel('whatsapp')}
                  disabled={isSending}
                  className={classNames(
                    'p-4 rounded-xl border-2 transition-all',
                    selectedChannel === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300',
                    isSending && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <MessageSquare
                      size={16}
                      className={selectedChannel === 'whatsapp' ? 'text-emerald-600' : 'text-slate-400'}
                    />
                    <span
                      className={classNames(
                        'font-bold text-sm',
                        selectedChannel === 'whatsapp' ? 'text-emerald-600' : 'text-slate-600'
                      )}
                    >
                      WhatsApp
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChannel('sms')}
                  disabled={isSending}
                  className={classNames(
                    'p-4 rounded-xl border-2 transition-all',
                    selectedChannel === 'sms'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300',
                    isSending && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Smartphone
                      size={16}
                      className={selectedChannel === 'sms' ? 'text-blue-600' : 'text-slate-400'}
                    />
                    <span
                      className={classNames(
                        'font-bold text-sm',
                        selectedChannel === 'sms' ? 'text-blue-600' : 'text-slate-600'
                      )}
                    >
                      SMS
                    </span>
                  </div>
                </button>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">
                  This will send reminders to all defaulters. Make sure you want to proceed.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Reminders'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
