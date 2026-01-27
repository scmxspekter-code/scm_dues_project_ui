
import React from 'react';
import { Search, Filter, Plus, Mail, Phone, ArrowUpDown, Loader2 } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { AddMemberDrawer } from '../components/AddMemberDrawer';
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { Member } from '../types';
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
              { label: 'All Members', onClick: () => console.log('All') },
              { label: 'Paid Only', onClick: () => console.log('Paid') },
              { label: 'Pending', onClick: () => console.log('Pending') },
              { divider: true },
              { label: 'Defaulters', onClick: () => console.log('Defaulters') },
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
                  <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{member.name}</div>
                    <div className="text-xs text-slate-400 italic">Joined {formatDate(new Date(member.createdAt), 'dd MM yyyy')}</div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: (member) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  member.paymentStatus === 'paid' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : member.paymentStatus === 'failed' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-amber-50 text-amber-600'
                }`}>
                  {member.paymentStatus.charAt(0).toUpperCase() + member.paymentStatus.slice(1)}
                </span>
              ),
            },
            {
              header: 'Dues Owed',
              accessor: (member) => (
                <span className="font-semibold text-slate-700">₦{member.amount.toLocaleString()}</span>
              ),
            },
            {
              header: 'Contact',
              accessor: () => (
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><Mail size={16} /></button>
                  <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><Phone size={16} /></button>
                  <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><WhatsApp size={16} /></button>
                </div>
              ),
            },
            {
              header: 'Actions',
              align: 'right',
              accessor: (member) => (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                  }}
                  className="text-cyan-600 font-bold text-sm hover:underline"
                >
                  View Profile
                </button>
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

// Internal icon shim
const WhatsApp = ({size, className}: {size?: number, className?: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);
