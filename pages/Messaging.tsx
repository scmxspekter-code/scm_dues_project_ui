
import React from 'react';
import { Send, Wand2, Clock, History, LayoutTemplate, Smartphone } from 'lucide-react';
import { generateDuesReminder } from '../services/geminiService';

export const Messaging: React.FC = () => {
  const [recipientType, setRecipientType] = React.useState('defaulters');
  const [channel, setChannel] = React.useState('whatsapp');
  const [message, setMessage] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    const content = await generateDuesReminder("[Member Name]", 50000, "Feb 28, 2025");
    setMessage(content);
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Composer Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Smartphone className="mr-2 text-cyan-600" size={20} />
            Compose Message
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Target Audience</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                >
                  <option value="defaulters">All Defaulters (72)</option>
                  <option value="paid">All Paid Members (84)</option>
                  <option value="all">Everyone (156)</option>
                  <option value="custom">Specific Member</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Delivery Channel</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${channel === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => setChannel('sms')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${channel === 'sms' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase">Message Content</label>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1 text-cyan-600 text-xs font-bold hover:text-cyan-700 transition-colors disabled:opacity-50"
                >
                  <Wand2 size={14} className={isGenerating ? 'animate-pulse' : ''} />
                  <span>{isGenerating ? 'AI Thinking...' : 'Generate with AI'}</span>
                </button>
              </div>
              <textarea 
                rows={6}
                placeholder="Type your message here... Use [Member Name] for personalization."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none font-medium text-slate-700"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors font-medium">
                <Clock size={18} />
                <span>Schedule for later</span>
              </button>
              <button className="flex items-center space-x-2 px-8 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold">
                <Send size={18} />
                <span>Blast Broadcast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center">
            <LayoutTemplate className="mr-2 text-cyan-600" size={18} />
            Quick Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TemplateCard title="Birthday Wish" type="Celebration" />
            <TemplateCard title="Final Dues Warning" type="Urgent" />
            <TemplateCard title="AGM Notification" type="Event" />
            <TemplateCard title="Payment Received" type="System" />
          </div>
        </div>
      </div>

      {/* Stats/History Side */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center">
            <History className="mr-2 text-cyan-600" size={18} />
            Recent History
          </h4>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Monthly Dues Reminder</p>
                  <p className="text-xs text-slate-400">Sent to 72 members • 2 hrs ago</p>
                  <div className="mt-1 flex space-x-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-cyan-600 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateCard = ({title, type}: {title: string, type: string}) => (
  <div className="p-4 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/20 transition-all cursor-pointer group">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{type}</div>
    <div className="font-bold text-slate-700 group-hover:text-cyan-600 transition-colors">{title}</div>
  </div>
);
