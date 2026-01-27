
import React from 'react';
import { X, History, Send, Wand2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Member, ReminderHistory } from '../types';
import { generateDuesReminder } from '../services/geminiService';

interface DefaulterActionModalProps {
  member: Member;
  onClose: () => void;
}

export const DefaulterActionModal: React.FC<DefaulterActionModalProps> = ({ member, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'history' | 'message'>('history');
  const [customMsg, setCustomMsg] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    const content = await generateDuesReminder(member.name, member.amountDue, "Next Friday");
    setCustomMsg(content);
    setIsGenerating(false);
  };

  const handleSendMessage = () => {
    alert(`Message sent to ${member.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
              <p className="text-sm text-slate-500 font-medium">Owes ₦{member.amount.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-slate-100 bg-white">
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
          >
            Reminder History
          </button>
          <button 
            onClick={() => setActiveTab('message')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'message' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400'}`}
          >
            Send Custom Message
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'history' ? (
            <div className="space-y-6">
              {member.reminderHistory?.length ? (
                member.reminderHistory.map((h, i) => (
                  <div key={h.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${h.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {h.status === 'Delivered' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">{h.type} • {h.date}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${h.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{h.status}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{h.content}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 italic font-medium">
                  No reminders sent yet to this member.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message Text</span>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 text-cyan-600 text-xs font-bold bg-cyan-50 px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-all disabled:opacity-50"
                >
                  <Wand2 size={14} className={isGenerating ? 'animate-pulse' : ''} />
                  <span>{isGenerating ? 'Drafting...' : 'AI Drafting Assist'}</span>
                </button>
              </div>
              <textarea 
                rows={8}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Write your custom reminder here..."
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 font-medium text-slate-700 resize-none transition-all"
              />
              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">
                  Message will be sent to {member.phone} via WhatsApp as primary channel.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">
            Cancel
          </button>
          {activeTab === 'message' && (
            <button 
              onClick={handleSendMessage}
              className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition-all"
            >
              <Send size={18} />
              <span>Send Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
