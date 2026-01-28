import React from 'react';
import { Search, Filter, Plus, Phone, MoreVertical } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { AddMemberDrawer } from '../components/AddMemberDrawer';
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { Member, PaymentStatus } from '../types';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Pagination } from '../components/Pagination';
import { Table } from '../components/Table';
import { formatDate } from 'date-fns';

export const Members: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    members,
    toggleAddMemberDrawer,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    apiState,
    setSelectedMember,
    deleteMember,
    markAsPaid,
    setStatusFilter,
  } = useMembers();
  return (
    <>
      <AddMemberDrawer />
      <div className="flex flex-col h-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search members by name or email..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              className="bg-white border-slate-200  h-full"
              containerClassName="space-y-0 "
            />
          </div>
          <div className="flex items-center space-x-3">
            <Dropdown
              trigger={
                <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium">
                  <Filter size={18} />
                  <span>Filter</span>
                </button>
              }
              items={[
                { label: 'All Members', onClick: () => setStatusFilter(undefined) },
                { label: 'Paid Only', onClick: () => setStatusFilter(PaymentStatus.PAID) },
                { label: 'Pending', onClick: () => setStatusFilter(PaymentStatus.PENDING) },
                { label: 'Failed', onClick: () => setStatusFilter(PaymentStatus.FAILED) },
              ]}
              placement="bottom-right"
            />
            <button
              onClick={toggleAddMemberDrawer}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium"
            >
              <Plus size={18} />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <Table<Member>
            columns={[
              {
                header: 'Member',
                accessor: (member) => (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        {member.name}
                      </div>
                      <div className="text-xs text-slate-400 italic">
                        Joined {formatDate(new Date(member.createdAt), 'dd MM yyyy')}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (member) => (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      member.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : member.paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {member.paymentStatus.charAt(0).toUpperCase() + member.paymentStatus.slice(1)}
                  </span>
                ),
              },
              {
                header: 'Dues Owed',
                accessor: (member) => (
                  <span className="font-semibold text-slate-700">
                    ₦{member.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Contact',
                accessor: (member) => (
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${member.phoneNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"
                      title={`Call ${member.phoneNumber}`}
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (member) => (
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}
                      className="text-cyan-600 font-bold text-sm hover:underline whitespace-nowrap"
                    >
                      View Profile
                    </button>
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      }
                      items={[
                        {
                          label: 'Edit Member',
                          onClick: () => {
                            // TODO: Open edit modal
                            // Edit member functionality to be implemented
                            void member;
                          },
                        },
                        {
                          label: 'Mark as Paid',
                          onClick: () => markAsPaid(member.id),
                          disabled: member.paymentStatus === PaymentStatus.PAID,
                        },
                        { divider: true },
                        {
                          label: 'Delete',
                          onClick: () => deleteMember(member.id, member.name),
                          className: 'text-red-600',
                        },
                      ]}
                      placement="bottom-right"
                    />
                  </div>
                ),
              },
            ]}
            data={members}
            isLoading={apiState.getMembers}
            emptyState={
              <div className="py-20 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="text-slate-300" size={40} />
                </div>
                <h5 className="font-bold text-slate-800 text-lg">No members found</h5>
                <p className="text-slate-400 text-sm">Try adjusting your search filters.</p>
              </div>
            }
            loadingState={undefined}
            containerClassName="flex-1 min-h-0 border-0 shadow-none rounded-none"
          />

          {/* Pagination */}

          <div className="flex-shrink-0 border-t border-slate-100">
            <Pagination
              meta={paginationMeta}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className="bg-transparent"
              disabled={apiState.getMembers}
            />
          </div>
        </div>
      </div>

      {/* Member Detail Drawer */}
      <MemberDetailDrawer />
    </>
  );
};
