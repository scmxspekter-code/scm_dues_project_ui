import React, { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import { Member } from '@/types';

interface BulkPaymentLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (ids: string[]) => Promise<void>;
  members: Member[];
  isCreating: boolean;
}

const DURATION = 0.25;
const EASE_OUT = 'power2.out';
const EASE_IN = 'power2.in';

export const BulkPaymentLinksModal: React.FC<BulkPaymentLinksModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  members,
  isCreating,
}) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
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

  const handleToggleMember = (id: string): void => {
    const newSet = new Set(selectedMemberIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMemberIds(newSet);
  };

  const handleSelectAll = (): void => {
    if (selectedMemberIds.size === members.length) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(members.map((m) => m.id)));
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (selectedMemberIds.size === 0) {
      return;
    }
    await onCreate(Array.from(selectedMemberIds));
    setSelectedMemberIds(new Set());
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 shrink-0 border-b border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Create Bulk Payment Links</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Select members to create payment links for
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
              >
                {selectedMemberIds.size === members.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-slate-500">
                {selectedMemberIds.size} of {members.length} selected
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {members.map((member) => {
                const isSelected = selectedMemberIds.has(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    className={classNames(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={classNames(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                            isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.phoneNumber}</p>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-cyan-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {members.length === 0 && (
              <div className="py-12 text-center">
                <AlertCircle size={16} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No members available</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-6 border-t border-slate-200 shrink-0">
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || selectedMemberIds.size === 0}
              className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Link2 size={16} />
              <span>
                {isCreating
                  ? 'Creating...'
                  : `Create ${selectedMemberIds.size} Payment Link${selectedMemberIds.size !== 1 ? 's' : ''}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
