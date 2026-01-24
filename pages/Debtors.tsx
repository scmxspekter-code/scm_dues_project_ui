
import React from 'react';
import { Search, Download, History, MessageSquare, ArrowUpDown, Filter } from 'lucide-react';
import { Member, PaymentStatus } from '../types';
import { DebtorActionModal } from '../components/DebtorActionModal';

const mockDebtors: Member[] = [
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '08123456789', 
    status: PaymentStatus.DEFAULTER, 
    amountDue: 50000, 
    joinedDate: '2023-06-20',
    reminderHistory: [
      { id: 'h1', date: '2025-02-01', content: 'Gentle reminder for your annual dues.', status: 'Delivered', type: 'WhatsApp' },
      { id: 'h2', date: '2025-02-15', content: 'Urgent: Payment overdue.', status: 'Delivered', type: 'SMS' }
    ]
  },
  { id: '5', name: 'Chidi Anagonye', email: 'chidi@example.com', phone: '08155667788', status: PaymentStatus.DEFAULTER, amountDue: 75000, joinedDate: '2023-12-01', reminderHistory: [] },
  { id: '7', name: 'Funke Akindele', email: 'funke@scm.ng', phone: '07099887766', status: PaymentStatus.DEFAULTER, amountDue: 120000, joinedDate: '2022-01-01', reminderHistory: [] },
];

export const Debtors: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedDebtor, setSelectedDebtor] = React.useState<Member | null>(null);

  const handleExport = () => {
    const headers = "ID,Name,Phone,Amount Due,Joined Date\n";
    const rows = mockDebtors.map(d => `${d.id},${d.name},${d.phone},${d.amountDue},${d.joinedDate}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scm_debtors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredDebtors = mockDebtors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search debtors by name..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3 border border-slate-200 bg-white rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 font-bold shadow-sm"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-cyan-600 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center">
            Defaulter Watchlist 
            <span className="ml-3 px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-extrabold uppercase tracking-tight">
              {mockDebtors.length} Members
            </span>
          </h3>
          <button className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center hover:text-slate-600 transition-colors">
            Sort by Amount <ArrowUpDown size={12} className="ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Debtor Info</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Reminders Sent</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Owed</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDebtors.map((debtor) => (
                <tr key={debtor.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                        {debtor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{debtor.name}</div>
                        <div className="text-sm text-slate-400 font-medium">{debtor.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${debtor.reminderHistory?.length ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                      {debtor.reminderHistory?.length || 0} Sent
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900 text-lg">₦{debtor.amountDue.toLocaleString()}</span>
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">CRITICAL DEBT</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setSelectedDebtor(debtor)}
                        className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedDebtor(debtor)}
                        className="px-5 py-3 rounded-2xl bg-cyan-600 text-white font-bold text-sm flex items-center space-x-2 hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
                      >
                        <MessageSquare size={16} />
                        <span>Remind</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDebtor && (
        <DebtorActionModal 
          member={selectedDebtor} 
          onClose={() => setSelectedDebtor(null)} 
        />
      )}
    </div>
  );
};
