import React from 'react';
import { Search, Download, Filter, Calendar, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Table } from '@/components/Table';
import { PaymentRecord } from '../types';
import { formatDate } from 'date-fns';
import classNames from 'classnames';

export const Payments: React.FC = () => {
  const {
    payments,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    apiState,
    exportPayments,
  } = usePayments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle size={16} className="text-emerald-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'pending':
        return <Clock size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-emerald-50 text-emerald-600';
      case 'failed':
        return 'bg-red-50 text-red-600';
      case 'pending':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search payments by payer name, email, or reference..."
            leftIcon={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
            className="bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 text-sm"
            containerClassName="space-y-0"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Dropdown
            trigger={
              <button className="flex items-center space-x-2 px-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm shadow-sm">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            }
            items={[
              {
                label: 'All Status',
                onClick: () => setStatusFilter(undefined),
              },
              {
                label: 'Successful',
                onClick: () => setStatusFilter('successful'),
              },
              {
                label: 'Failed',
                onClick: () => setStatusFilter('failed'),
              },
              {
                label: 'Pending',
                onClick: () => setStatusFilter('pending'),
              },
            ]}
            placement="bottom-right"
          />
          <button
            onClick={exportPayments}
            disabled={apiState.exportPayments}
            className="flex items-center space-x-2 px-3 py-3 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {apiState.exportPayments ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <Table<PaymentRecord>
          columns={[
            {
              header: 'Payment Details',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 text-sm">
                    ₦{payment.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {payment.payerName || payment.payerEmail || 'N/A'}
                  </div>
                  {payment.providerReference && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {payment.providerReference.slice(0, 12)}...
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: 'Provider',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <span className="font-medium text-slate-700 capitalize">{payment.provider}</span>
              ),
            },
            {
              header: 'Method',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <span className="text-sm text-slate-600 capitalize">{payment.paymentMethod}</span>
              ),
            },
            {
              header: 'Status',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payment.status)}
                  <span
                    className={classNames(
                      'px-3 py-1 rounded-full text-xs font-bold capitalize',
                      getStatusColor(payment.status)
                    )}
                  >
                    {payment.status}
                  </span>
                </div>
              ),
            },
            {
              header: 'Date',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-slate-800">
                    {formatDate(new Date(payment.paymentDate || payment.createdAt), 'dd MMM yyyy')}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(new Date(payment.paymentDate || payment.createdAt), 'HH:mm')}
                  </div>
                </div>
              ),
            },
            {
              header: 'Fee',
              headerClassName: 'px-8 py-5 text-[10px]',
              accessor: (payment) => (
                <span className="text-sm text-slate-600">
                  {payment.fee > 0 ? `₦${payment.fee.toLocaleString()}` : 'N/A'}
                </span>
              ),
            },
          ]}
          data={payments}
          isLoading={apiState.getPayments}
          emptyState={
            <div className="py-20 text-center flex flex-col items-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Search className="text-slate-300" size={16} />
              </div>
              <h5 className="font-bold text-slate-800 text-sm">No payment records found</h5>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm || statusFilter
                  ? 'Try adjusting your filters.'
                  : 'Payment records will appear here once payments are processed.'}
              </p>
            </div>
          }
          loadingState={undefined}
          onRowClick={(payment) => {
            // Could navigate to member detail or payment detail
          }}
          rowClassName="hover:bg-slate-50/50 transition-colors cursor-pointer"
        />
      </div>
    </div>
  );
};
