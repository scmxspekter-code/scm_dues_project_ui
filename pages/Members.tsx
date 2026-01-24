
import React from 'react';
// Fix: Removed WhatsApp from lucide-react import as it is defined locally at the bottom of the file
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';
import { Member, PaymentStatus } from '../types';

const mockMembers: Member[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '08012345678', status: PaymentStatus.PAID, amountDue: 0, joinedDate: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '08123456789', status: PaymentStatus.DEFAULTER, amountDue: 50000, joinedDate: '2023-06-20' },
  { id: '3', name: 'Ayo Balogun', email: 'ayo@example.com', phone: '09033344455', status: PaymentStatus.PENDING, amountDue: 50000, joinedDate: '2024-02-10' },
  { id: '4', name: 'Sarah Connor', email: 'sarah@example.com', phone: '07011223344', status: PaymentStatus.PAID, amountDue: 0, joinedDate: '2022-11-05' },
  { id: '5', name: 'Chidi Anagonye', email: 'chidi@example.com', phone: '08155667788', status: PaymentStatus.DEFAULTER, amountDue: 75000, joinedDate: '2023-12-01' },
];

export const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredMembers = mockMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search members by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-medium">
            <Plus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dues Owed</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-400 italic">Joined {member.joinedDate}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.status === PaymentStatus.PAID 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : member.status === PaymentStatus.DEFAULTER 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-amber-50 text-amber-600'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-700">₦{member.amountDue.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><Mail size={16} /></button>
                    <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><Phone size={16} /></button>
                    <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-cyan-600 transition-colors"><WhatsApp size={16} /></button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-cyan-600 font-bold text-sm hover:underline">View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Search className="text-slate-300" size={40} />
            </div>
            <h5 className="font-bold text-slate-800 text-lg">No members found</h5>
            <p className="text-slate-400 text-sm">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal icon shim
const WhatsApp = ({size, className}: {size?: number, className?: string}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);
