import React from 'react';
import { Search, Filter, Plus, Phone, Link2, Upload, Eye, Pencil } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { AddMemberDrawer } from '../components/AddMemberDrawer';
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { EditMemberDrawer } from '../components/EditMemberDrawer';
import { BulkPaymentLinksModal } from '../components/BulkPaymentLinksModal';
import { BulkUploadMembersModal } from '../components/BulkUploadMembersModal';
import { Member, PaymentStatus } from '../types';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Pagination } from '../components/Pagination';
import { Table } from '@/components/Table';
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
    setStatusFilter,
    createPaymentLinksBulk,
    createMembersBulk,
    isBulkPaymentLinksModalOpen,
    setIsBulkPaymentLinksModalOpen,
    isBulkUploadModalOpen,
    setIsBulkUploadModalOpen,
    selectedMember,
    setSelectedMember,
    memberForEdit,
    isDetailDrawerOpen,
    isEditDrawerOpen,
    closeDetailDrawer,
    openEditDrawer,
    closeEditDrawer,
  } = useMembers();

  return (
    <>
      <AddMemberDrawer />
      <BulkPaymentLinksModal
        isOpen={isBulkPaymentLinksModalOpen}
        onClose={() => setIsBulkPaymentLinksModalOpen(false)}
        onCreate={createPaymentLinksBulk}
        members={members}
        isCreating={apiState.createPaymentLinksBulk}
      />
      <BulkUploadMembersModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onUpload={createMembersBulk}
        isUploading={apiState.createMembersBulk}
      />
      <div className="flex flex-col h-full min-h-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 shrink-0">
          <div className="flex-1 min-w-0 w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Search members by name or email..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              className="bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 text-sm"
              containerClassName="space-y-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Dropdown
              trigger={
                <button className="flex items-center space-x-2 px-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm shadow-sm">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
              }
              items={[
                { label: 'All Members', onClick: () => setStatusFilter(undefined) },
                { label: 'Paid Only', onClick: () => setStatusFilter(PaymentStatus.PAID) },
                { label: 'Pending', onClick: () => setStatusFilter(PaymentStatus.PENDING) },
                { label: 'Failed', onClick: () => setStatusFilter(PaymentStatus.FAILED) },
              ]}
              placement="bottom-left"
            />
            <button
              onClick={() => setIsBulkUploadModalOpen(true)}
              disabled={apiState.createMembersBulk}
              className="flex items-center space-x-2 px-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              <span>Bulk Upload</span>
            </button>
            <button
              onClick={() => setIsBulkPaymentLinksModalOpen(true)}
              disabled={apiState.createPaymentLinksBulk || members.length === 0}
              className="flex items-center space-x-2 px-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Link2 size={16} />
              <span>Bulk</span>
            </button>
            <button
              onClick={toggleAddMemberDrawer}
              className="flex items-center space-x-2 px-3 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold text-sm"
            >
              <Plus size={16} />
              <span>Member</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
          <Table<Member>
            columns={[
              {
                header: 'Member',
                headerClassName: 'px-8 py-5 text-[10px]',
                accessor: (member) => (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 shrink-0 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        {member.name}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
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
                  <span className="font-semibold text-slate-700 text-sm">
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
                      className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"
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
                         className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDrawer(member);
                      }}
                 className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={members}
            isLoading={apiState.getMembers}
            emptyState={
              <div className="py-20 text-center flex flex-col items-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Search className="text-slate-300" size={16} />
                </div>
                <h5 className="font-bold text-slate-800 text-sm">No members found</h5>
                <p className="text-slate-400 text-sm">Try adjusting your search filters.</p>
              </div>
            }
            loadingState={undefined}
            containerClassName="flex-1 min-h-0 border-0 shadow-none rounded-none"
          />

          {/* Pagination */}

          <div className="shrink-0 border-t border-slate-100">
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

      {/* Member Detail Drawer (preview) - state from useMembers */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={isDetailDrawerOpen}
        onClose={closeDetailDrawer}
      />
      <EditMemberDrawer
        member={memberForEdit}
        isOpen={isEditDrawerOpen}
        onClose={closeEditDrawer}
      />
    </>
  );
};
