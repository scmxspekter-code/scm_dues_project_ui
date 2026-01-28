import React, { useState } from 'react';
import {
  Search,
  Download,
  History,
  MessageSquare,
  ArrowUpDown,
  Filter,
  Loader2,
  Send,
} from 'lucide-react';
import { DefaulterActionModal } from '../components/DefaulterActionModal';
import { BulkReminderModal } from '../components/BulkReminderModal';
import { useDefaulters } from '../hooks/useDefaulters';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Pagination } from '../components/Pagination';
import { Table } from '../components/Table';
import { useAppSelector } from '@/store/hooks';
import { Member } from '../types';

export const Defaulters: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    setSelectedDefaulter,
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
  } = useDefaulters();

  const { defaulters } = useAppSelector((state) => state.defaulters);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search defaulters by name..."
            leftIcon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
            className="bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10"
            containerClassName="space-y-0"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsBulkReminderModalOpen(true)}
            disabled={isSendingBulkReminders || isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingBulkReminders ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Bulk Reminders</span>
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-6 py-3 border border-slate-200 bg-white rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Export CSV</span>
              </>
            )}
          </button>
          <Dropdown
            trigger={
              <button className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-cyan-600 transition-colors shadow-sm">
                <Filter size={18} />
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

      <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
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
                  <div className="w-12 h-12 rounded-2xl shrink-0 bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                    {defaulter.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-base whitespace-nowrap">
                      {defaulter.name}
                    </div>
                    <div className="text-sm text-slate-400 font-medium whitespace-nowrap">
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
                  <span className="font-extrabold text-slate-900 text-lg">
                    ₦{defaulter.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                    CRITICAL DEBT
                  </span>
                </div>
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
                      setSelectedDefaulter(defaulter);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                    title="View History"
                  >
                    <History size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsDefaulted(defaulter.id, defaulter.name);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all"
                    title="Mark as Defaulted"
                  >
                    Mark Defaulted
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDefaulter(defaulter);
                    }}
                    className="px-5 py-3 rounded-2xl bg-cyan-600 text-white font-bold text-sm flex items-center space-x-2 hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
                  >
                    <MessageSquare size={16} />
                    <span>Remind</span>
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
                <Search className="text-slate-300" size={40} />
              </div>
              <h5 className="font-bold text-slate-800 text-lg">No defaulters found</h5>
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

      <DefaulterActionModal />

      {/* Bulk Reminder Modal */}
      <BulkReminderModal
        isOpen={isBulkReminderModalOpen}
        onClose={() => setIsBulkReminderModalOpen(false)}
        onSend={sendRemindersBulk}
        isSending={isSendingBulkReminders}
      />
    </div>
  );
};
