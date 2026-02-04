import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  History,
  ArrowUpDown,
  Filter,
  Loader2,
  Send,
  X,
  Bell,
} from 'lucide-react';
import gsap from 'gsap';
import { DefaulterActionModal } from '../components/DefaulterActionModal';
import { BulkReminderModal } from '../components/BulkReminderModal';
import { useDefaulters } from '../hooks/useDefaulters';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Pagination } from '../components/Pagination';
import { Table } from '@/components/Table';
import { useAppSelector } from '@/store/hooks';
import { Member, PaymentStatus } from '../types';

export const Defaulters: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    handleExport,
    markAsDefaulted,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    sortField,
    sortOrder,
    handleSort,
    isLoading,
    isExporting,
    sendRemindersBulk,
    isSendingBulkReminders,
    isBulkReminderModalOpen,
    setIsBulkReminderModalOpen,
    isMarkingAsDefaulted,
    markAsPaid,
    isMarkingAsPaid,
    setSelectedDefaulter,
  } = useDefaulters();
  const { defaulters } = useAppSelector((state) => state.defaulters);
  const [defaulterToConfirm, setDefaulterToConfirm] = useState<Member | null>(null);

  // GSAP refs for confirmation modal
  const confirmOverlayRef = useRef<HTMLDivElement | null>(null);
  const confirmPanelRef = useRef<HTMLDivElement | null>(null);

  // Animate confirmation modal in when a defaulter is set
  useEffect(() => {
    if (!defaulterToConfirm) return;
    const overlay = confirmOverlayRef.current;
    const panel = confirmPanelRef.current;
    if (!overlay || !panel) return;

    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo(
      panel,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
    );
  }, [defaulterToConfirm]);

  const closeConfirmModal = (): void => {
    const overlay = confirmOverlayRef.current;
    const panel = confirmPanelRef.current;

    if (!overlay || !panel) {
      setDefaulterToConfirm(null);
      return;
    }

    gsap.to(panel, {
      y: 20,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setDefaulterToConfirm(null),
    });
  };

  const handleConfirmDefault = async (): Promise<void> => {
    if (!defaulterToConfirm) return;
    await markAsDefaulted(defaulterToConfirm.id, defaulterToConfirm.name);
    closeConfirmModal();
  };

  return (
    <>
      <div className="flex flex-col h-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search defaulters by name..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              className="bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 text-sm"
              containerClassName="space-y-0"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBulkReminderModalOpen(true)}
              disabled={isSendingBulkReminders || isLoading}
              className="flex items-center space-x-2 px-3 py-3 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingBulkReminders ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Bulk Reminders</span>
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 p-3 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Export</span>
                </>
              )}
            </button>
            <Dropdown
              trigger={
                <button className="flex items-center justify-center p-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-cyan-600 transition-colors shadow-sm">
                  <Filter size={16} />
                </button>
              }
              items={[
                {
                  label: `Sort by Amount ${sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                  icon: <ArrowUpDown size={16} />,
                  onClick: () => handleSort('amount'),
                  className: sortField === 'amount' ? 'bg-cyan-50 text-cyan-600 font-bold' : '',
                },
                {
                  label: `Sort by Date ${sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                  icon: <ArrowUpDown size={16} />,
                  onClick: () => handleSort('createdAt'),
                  className: sortField === 'createdAt' ? 'bg-cyan-50 text-cyan-600 font-bold' : '',
                },
                {
                  label: `Sort by Name ${sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                  icon: <ArrowUpDown size={16} />,
                  onClick: () => handleSort('name'),
                  className: sortField === 'name' ? 'bg-cyan-50 text-cyan-600 font-bold' : '',
                },
              ]}
              placement="bottom-right"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl  shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex sm:flex-row flex-col gap-3 items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center">
              Defaulter Watchlist
              <span className="ml-3 px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-extrabold uppercase tracking-tight">
                {defaulters?.length} Members
              </span>
            </h3>
            <button
              onClick={() => handleSort('amount')}
              className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center hover:text-slate-600 transition-colors"
            >
              Sort by Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}{' '}
              <ArrowUpDown size={12} className="ml-1" />
            </button>
          </div>

          <Table<Member>
            columns={[
              {
                header: 'Defaulter Info',
                headerClassName: 'px-8 py-5 text-[10px]',
                accessor: (defaulter) => (
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded shrink-0 bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                      {defaulter.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        {defaulter.name}
                      </div>
                      <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {defaulter.phoneNumber}
                      </div>
                    </div>
                  </div>
                ),
                className: 'px-8 py-5',
              },
              {
                header: 'Reminders Sent',
                align: 'center',
                headerClassName: 'px-8 py-5 text-[10px]',
                accessor: () => (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-400">
                    0 Sent
                  </span>
                ),
                className: 'px-8 py-5',
              },
              {
                header: 'Amount Owed',
                headerClassName: 'px-8 py-5 text-[10px]',
                accessor: (defaulter) => (
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₦{defaulter.amount.toLocaleString()}
                    </span>
                    {defaulter.amount > 1000000 && (
                      <span className="text-[7px] tracking-wider text-red-500 font-bold uppercase ">
                        CRITICAL DEBT
                      </span>
                    )}
                  </div>
                ),
                className: 'px-8 py-5',
              },
              {
                header: 'Payment Status',
                headerClassName: 'px-8 py-5 text-[10px]',
                align: 'center',
                accessor: (defaulter) => (
                  defaulter.paymentStatus === PaymentStatus.PAID ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-tight">
                      Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void markAsPaid(defaulter.id);
                      }}
                      disabled={isMarkingAsPaid}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tight"
                    >
                      Mark as paid
                    </button>
                  )
                ),
                className: 'px-8 py-5',
              },
              {
                header: 'Actions',
                align: 'right',
                headerClassName: 'px-8 py-5 text-[10px]',
                accessor: (defaulter) => (
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDefaulter(defaulter, 'history');
                      }}
                      className="p-2 rounded bg-slate-100 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                      title="View History"
                    >
                      <History size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaulterToConfirm(defaulter);
                      }}
                      className="p-2 rounded bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all"
                      title="Mark as Defaulted"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDefaulter(defaulter, 'message');
                      }}
                      className="p-2 rounded bg-cyan-600 text-white font-bold text-sm flex items-center space-x-2 hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
                    >
                      <Bell size={16} />
                    </button>
                  </div>
                ),
                className: 'px-8 py-5',
              },
            ]}
            data={defaulters}
            isLoading={isLoading}
            emptyState={
              <div className="py-20 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="text-slate-300" size={16} />
                </div>
                <h5 className="font-bold text-slate-800 text-sm">No defaulters found</h5>
                <p className="text-slate-400 text-sm">Try adjusting your search filters.</p>
              </div>
            }
            loadingState={undefined}
            containerClassName="flex-1 min-h-0 border-0 shadow-none rounded-none"
            headerClassName="bg-slate-50 border-b border-slate-100"
          />

          {/* Pagination */}

          <div className="shrink-0 border-t border-slate-100">
            <Pagination
              meta={paginationMeta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className="bg-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Bulk Reminder Modal */}
      </div>
      <DefaulterActionModal />
      {defaulterToConfirm && (
        <div
          ref={confirmOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div
            ref={confirmPanelRef}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6 space-y-4"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Mark as defaulted?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to mark{' '}
                <span className="font-bold text-slate-800">{defaulterToConfirm.name}</span> as
                defaulted? This will move them into the defaulters list and update their status.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={isMarkingAsDefaulted}
                className="px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDefault}
                disabled={isMarkingAsDefaulted}
                className="px-3 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMarkingAsDefaulted ? 'Marking...' : 'Yes, mark as defaulted'}
              </button>
            </div>
          </div>
        </div>
      )}
      <BulkReminderModal
        isOpen={isBulkReminderModalOpen}
        onClose={() => setIsBulkReminderModalOpen(false)}
        onSend={sendRemindersBulk}
        isSending={isSendingBulkReminders}
      />
    </>
  );
};
