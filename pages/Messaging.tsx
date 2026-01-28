import React from 'react';
import { Send, Clock, History, LayoutTemplate, Smartphone, Users, Eye, Trash2 } from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';
import { CustomSelect } from '../components/CustomSelect';
import { RecipientType } from '../hooks/useMessaging';
import classNames from 'classnames';
import { formatDate } from 'date-fns';

export const Messaging: React.FC = () => {
  const {
    recipientType,
    setRecipientType,
    channel,
    setChannel,
    message,
    setMessage,
    title,
    setTitle,
    activeTab,
    setActiveTab,
    messageHistory,
    announcements,
    isLoadingHistory,
    isLoadingAnnouncements,
    isSending,
    handleSend,
    handleDeleteAnnouncement,
    handleViewAnnouncement,
    refreshHistory,
    sendAnnouncement,
    apiState,
  } = useMessaging();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
      {/* Composer Area */}
      <div className="xl:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
            <Smartphone className="mr-2 text-cyan-600" size={20} />
            Compose Message
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Announcement Title
              </label>
              <input
                type="text"
                placeholder="Enter announcement title..."
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium text-slate-700 text-sm sm:text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <CustomSelect
                  label="Target Audience"
                  labelClassName="text-xs font-bold text-slate-400 uppercase"
                  value={recipientType}
                  onChange={(value) => setRecipientType(value as RecipientType)}
                  leftIcon={<Users size={16} />}
                  options={[
                    { value: 'defaulters', label: 'All Defaulters' },
                    { value: 'paid', label: 'All Paid Members' },
                    { value: 'all', label: 'Everyone' },
                    { value: 'custom', label: 'Specific Member' },
                  ]}
                  size="md"
                  className="p-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Delivery Channel
                </label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-all ${channel === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setChannel('sms')}
                    className={`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-all ${channel === 'sms' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Message Content</label>
              <textarea
                rows={6}
                placeholder="Type your message here... Use [Member Name] for personalization."
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none font-medium text-slate-700 text-sm sm:text-base"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4">
              <button className="flex items-center justify-center sm:justify-start space-x-2 text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm sm:text-base py-2 sm:py-0">
                <Clock size={18} />
                <span>Schedule for later</span>
              </button>
              <button
                onClick={handleSend}
                disabled={
                  isSending || apiState.sendAnnouncement || !message.trim() || !title.trim()
                }
                className="flex items-center justify-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Send size={18} />
                <span>
                  {isSending || apiState.sendAnnouncement ? 'Sending...' : 'Send Announcement'}
                </span>
              </button>
            </div>
          </div>
        </div>

          {/* Announcements List */}
          {activeTab === 'announcements' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm sm:text-base">
                <LayoutTemplate className="mr-2 text-cyan-600" size={18} />
                All Announcements
              </h4>
              {isLoadingAnnouncements ? (
                <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base">
                  Loading announcements...
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-cyan-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-bold text-slate-800 truncate">{announcement.title}</h5>
                            <span
                              className={classNames(
                                'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                                announcement.status === 'sent'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : announcement.status === 'failed'
                                    ? 'bg-red-50 text-red-600'
                                    : announcement.status === 'sending'
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-slate-50 text-slate-600'
                              )}
                            >
                              {announcement.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {announcement.content}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Target: {announcement.targetType}</span>
                            <span>Channel: {announcement.channel}</span>
                            {announcement.sentAt && (
                              <span>Sent: {formatDate(new Date(announcement.sentAt), 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4 shrink-0">
                          <button
                            onClick={() => handleViewAnnouncement(announcement.id)}
                            className="p-2 rounded-lg bg-white hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors"
                            title="View/Edit"
                          >
                            <Eye size={16} />
                          </button>
                          {announcement.status === 'draft' && (
                            <button
                              onClick={() => sendAnnouncement(announcement.id)}
                              disabled={apiState.sendAnnouncement}
                              className="p-2 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
                              title="Send"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            disabled={apiState.deleteAnnouncement}
                            className="p-2 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base">
                  No announcements yet. Create one to get started.
                </div>
              )}
            </div>
          )}

          {/* Templates */}
          {activeTab === 'compose' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm sm:text-base">
                <LayoutTemplate className="mr-2 text-cyan-600" size={18} />
                Quick Templates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <TemplateCard title="Birthday Wish" type="Celebration" />
                <TemplateCard title="Final Dues Warning" type="Urgent" />
                <TemplateCard title="AGM Notification" type="Event" />
                <TemplateCard title="Payment Received" type="System" />
              </div>
            </div>
          )}
        </div>

      {/* Stats/History Side */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 h-full max-h-[600px]">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm sm:text-base">
            <History className="mr-2 text-cyan-600" size={18} />
            Recent History
          </h4>
          {isLoadingHistory ? (
            <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base h-full flex items-center justify-center">
              Loading message history...
            </div>
          ) : (
            <div className="max-h-[400px] sm:max-h-[500px] lg:max-h-[450px] overflow-y-auto space-y-4 pr-2 h-full ">
              {messageHistory.length > 0 ? (
                messageHistory.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Smartphone size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-700 capitalize truncate">
                        {log.messageType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-400 wrap-break-words">
                        To {log.recipientName} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
                            log.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-600'
                              : log.status === 'failed'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{log.channel}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic font-medium text-sm sm:text-base">
                  No message history yet
                </div>
              )}
            </div>
          )}
          <button
            onClick={refreshHistory}
            className="w-full py-2 text-xs sm:text-sm font-bold text-cyan-600 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors mt-auto"
          >
            Refresh History
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateCard = ({ title, type }: { title: string; type: string }) => (
  <div className="p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/20 transition-all cursor-pointer group">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
      {type}
    </div>
    <div className="font-bold text-sm sm:text-base text-slate-700 group-hover:text-cyan-600 transition-colors">
      {title}
    </div>
  </div>
);
