import React, { useRef, useEffect, useMemo } from 'react';
import {
  Send,
  History,
  LayoutTemplate,
  Smartphone,
  Users,
  Eye,
  Trash2,
  Search,
  X,
  Megaphone,
} from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { CustomSelect } from '../components/CustomSelect';
import { RecipientType } from '../hooks/useMessaging';
import classNames from 'classnames';
import { formatDate } from 'date-fns';
import { Input } from '../components/Input';
import { Skeleton } from '../components/Skeleton';

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
    selectedMember,
    setSelectedMember,
    memberSearchQuery,
    setMemberSearchQuery,
    memberSearchResults,
    isSearchingMembers,
    memberSearchDropdownOpen,
    setMemberSearchDropdownOpen,
    isLoadingHistory,
    isLoadingMoreHistory,
    hasMoreHistory,
    loadMoreHistory,
    isLoadingAnnouncements,
    isLoadingMoreAnnouncements,
    hasMoreAnnouncements,
    loadMoreAnnouncements,
    isSending,
    handleSend,
    handleDeleteAnnouncement,
    handleViewAnnouncement,
    refreshHistory,
    sendAnnouncement,
    apiState,
  } = useMessaging();
  const memberSearchRef = useRef<HTMLDivElement>(null);

  const {
    sentinelRef: announcementsSentinelRef,
    scrollContainerRef: announcementsScrollRef,
  } = useInfiniteScroll({
    enabled: activeTab === 'announcements',
    hasMore: hasMoreAnnouncements,
    isLoading: isLoadingMoreAnnouncements,
    onLoadMore: loadMoreAnnouncements,
  });

  const {
    sentinelRef: historySentinelRef,
    scrollContainerRef: historyScrollRef,
  } = useInfiniteScroll({
    enabled: !isLoadingHistory && messageHistory.length > 0,
    hasMore: hasMoreHistory,
    isLoading: isLoadingMoreHistory,
    onLoadMore: loadMoreHistory,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(e.target as Node)) {
        setMemberSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setMemberSearchDropdownOpen]);
const memberName = useMemo(() => selectedMember?.name ?? 'User', [selectedMember]);
  return (
    <div className="grid   gap-4 sm:gap-6 xl:gap-8">
      {/* Composer Area */}
      <div className="grid grid-cols-1 xl:grid-cols-5 grid-rows-1  gap-2 grow">
        <div className="xl:col-span-3  bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
            <Smartphone className="mr-2 text-cyan-600" size={16} />
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
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/20 font-bold text-slate-700 text-sm"
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
              {recipientType === 'custom' && (
                <div className="space-y-2 sm:col-span-2" ref={memberSearchRef}>
                  <label className="text-xs font-bold text-slate-400 uppercase block">
                    Search and select member
                  </label>
                  {selectedMember ? (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-medium text-slate-800 flex-1 truncate">
                        {selectedMember.name}
                      </span>
                      <span className="text-sm text-slate-500 truncate">
                        {selectedMember.phoneNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMember(null);
                          setMemberSearchQuery('');
                          setMemberSearchDropdownOpen(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                        aria-label="Clear selection"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        onFocus={() =>
                          memberSearchResults.length > 0 && setMemberSearchDropdownOpen(true)
                        }
                        leftIcon={<Search size={16} className="text-slate-400" />}
                        size="md"
                        className="bg-slate-50 border-slate-200"
                      />
                      {memberSearchDropdownOpen &&
                        (memberSearchResults.length > 0 || isSearchingMembers) && (
                          <div className="mt-1 border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden max-h-60 overflow-y-auto z-10">
                            {isSearchingMembers ? (
                              <div className="p-4 text-center text-sm text-slate-500">
                                Searching...
                              </div>
                            ) : (
                              memberSearchResults.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setMemberSearchQuery('');
                                    setMemberSearchDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                                >
                                  <span className="font-medium text-slate-800">{member.name}</span>
                                  <span className="text-sm text-slate-500 truncate">
                                    {member.phoneNumber}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      {memberSearchQuery.trim() &&
                        !isSearchingMembers &&
                        memberSearchResults.length === 0 && (
                          <p className="text-sm text-slate-500 mt-1">
                            No members found. Try a different search.
                          </p>
                        )}
                    </>
                  )}
                </div>
              )}
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
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/20 resize-none font-bold text-slate-700 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

              <button
                onClick={handleSend}
                disabled={
                  isSending ||
                  apiState.sendAnnouncement ||
                  !message.trim() ||
                  !title.trim() ||
                  (recipientType === 'custom' && !selectedMember)
                }
                className="flex items-center justify-center space-x-2 px-3 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-100 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                <span>
                  {isSending || apiState.sendAnnouncement ? 'Sending...' : 'Send Announcement'}
                </span>
              </button>
            
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4 sm:space-y-6 flex grow min-h-0">
        <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 h-full grow min-h-0 ">
          <h4 className="font-bold text-slate-800  flex items-center text-sm">
            <History className="mr-2 text-cyan-600" size={16} />
            Recent History
          </h4>
          {isLoadingHistory ? (
            <div className="py-8 text-center text-slate-400 italic font-medium text-sm xl:h-full flex items-center justify-center h-[calc(100vh-33rem)]">
              Loading message history...
            </div>
          ) : (
            <div
              ref={historyScrollRef}
              className={classNames(
                'flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-2',
                {
                  'max-h-[calc(100vh-33rem)]': recipientType !== 'custom',
                  'xl:max-h-[calc(100vh-23rem)]': recipientType === 'custom',
                }
              )}
            >
              {messageHistory.length > 0 ? (
                <>
                  {messageHistory.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0 "
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
                  ))}
                  {isLoadingMoreHistory && (
                    <div className="py-4 text-center text-slate-400 text-xs font-medium">
                      Loading more...
                    </div>
                  )}
                  {hasMoreHistory && (
                    <div ref={historySentinelRef} className="h-4" aria-hidden />
                  )}
                </>
              ) : (
                <div
                  className={classNames(
                    'flex flex-col items-center justify-center text-center py-8 ',
                    recipientType !== 'custom'
                      ? 'min-h-[calc(100vh-34rem)]'
                      : 'min-h-[calc(100vh-24rem)]'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <History className="text-slate-400" size={24} />
                  </div>
                  <p className="text-slate-400 italic font-medium text-sm">
                    No message history yet
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={refreshHistory}
            className="w-full py-2 text-xs sm:text-sm font-bold text-white bg-cyan-600 rounded hover:bg-cyan-600/85 transition-colors mt-auto"
          >
            Refresh History
          </button>
        </div>
      </div>
      </div>

      {/* Tabbed content: Compose (Templates) | Announcements */}
      <div className="flex flex-col gap-4">
        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('compose')}
            className={classNames(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors',
              activeTab === 'compose'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            )}
          >
            <LayoutTemplate size={16} />
            <span>Compose & Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={classNames(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors',
              activeTab === 'announcements'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            )}
          >
            <Megaphone size={16} />
            <span>All Announcements</span>
          </button>
        </div>

        {/* Announcements List */}
        {activeTab === 'announcements' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col min-h-0">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm shrink-0">
              <Megaphone className="mr-2 text-cyan-600" size={16} />
              All Announcements
            </h4>
            {isLoadingAnnouncements ? (
              <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
                Loading announcements...
              </div>
            ) : announcements.length > 0 ? (
              <div
                ref={announcementsScrollRef}
                className="space-y-3 overflow-y-auto min-h-0 max-h-[calc(100vh-18rem)] pr-1"
              >
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-cyan-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-bold text-slate-800 truncate">
                            {announcement.title}
                          </h5>
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
                            <span>
                              Sent: {formatDate(new Date(announcement.sentAt), 'MMM dd, yyyy')}
                            </span>
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
                {isLoadingMoreAnnouncements && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={`announcement-skeleton-${i}`}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <Skeleton width="40%" height={16} className="rounded" />
                              <Skeleton width={56} height={20} className="rounded-full" />
                            </div>
                            <Skeleton width="90%" height={12} className="rounded" />
                            <Skeleton width="70%" height={12} className="rounded" />
                            <div className="flex gap-3">
                              <Skeleton width={80} height={10} className="rounded" />
                              <Skeleton width={60} height={10} className="rounded" />
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Skeleton variant="rectangular" width={36} height={36} className="rounded-lg" />
                            <Skeleton variant="rectangular" width={36} height={36} className="rounded-lg" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {hasMoreAnnouncements && (
                  <div ref={announcementsSentinelRef} className="h-4" aria-hidden />
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 italic font-medium text-sm">
                No announcements yet. Create one to get started.
              </div>
            )}
          </div>
        )}

        {/* Templates */}
        {activeTab === 'compose' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm">
              <LayoutTemplate className="mr-2 text-cyan-600" size={16} />
              Quick Templates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <TemplateCard
                title="Birthday Wish"
                type="Celebration"
                onClick={() => {
                  setTitle('Birthday Wish');
                  setMessage(
                    `Happy birthday ${selectedMember?.name??'to you'}! Wishing you joy, good health, and many more successful years with SCM Nigeria.`
                  );
                }}
              />
              <TemplateCard
                title="Final Dues Warning"
                type="Urgent"
                onClick={() => {
                  setTitle('Final Dues Warning');
                  setMessage(
                    `Dear ${memberName}, this is a final reminder that your dues are outstanding. Please make your payment as soon as possible to remain in good standing with SCM Nigeria.`
                  );
                }}
              />
              <TemplateCard
                title="AGM Notification"
                type="Event"
                onClick={() => {
                  setTitle('AGM Notification');
                  setMessage(
                    `Dear ${memberName}, you are invited to the upcoming Annual General Meeting (AGM). Please check your email or the members portal for date, time, and venue details.`
                  );
                }}
              />
              <TemplateCard
                title="Payment Received"
                type="System"
                onClick={() => {
                  setTitle('Payment Received');
                  setMessage(
                    `Hello ${memberName}, your payment has been received successfully. Thank you for keeping your dues up to date with SCM Nigeria.`
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TemplateCardProps {
  title: string;
  type: string;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, type, onClick }) => (
  <div
    className="p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/20 transition-all cursor-pointer group"
    onClick={onClick}
  >
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
      {type}
    </div>
    <div className="font-bold text-sm text-slate-700 group-hover:text-cyan-600 transition-colors">
      {title}
    </div>
  </div>
);
