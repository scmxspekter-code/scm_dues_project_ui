import React from 'react';
import { Cake, Heart, Send, Calendar, Loader2 } from 'lucide-react';
import { useCelebrations } from '../hooks/useCelebrations';
import { formatDate } from 'date-fns';
import classNames from 'classnames';

export const Celebrations: React.FC = () => {
  const {
    birthdays,
    anniversaries,
    activeTab,
    setActiveTab,
    isLoading,
    safeMessagingApiState,
    handleSendBirthdayMessage,
    handleSendAnniversaryMessage,
    handleSendBulkBirthdays,
    handleSendBulkAnniversaries,
  } = useCelebrations();


  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800">Celebrations</h2>
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('birthdays')}
              className={classNames(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2',
                activeTab === 'birthdays'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              <Cake size={16} />
              <span>Birthdays ({birthdays.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('anniversaries')}
              className={classNames(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2',
                activeTab === 'anniversaries'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              <Heart size={16} />
              <span>Anniversaries ({anniversaries.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <div className="text-center">
            <Loader2 size={16} className="animate-spin text-cyan-600 mx-auto mb-4" />
            <p className="text-slate-400 italic font-medium">Loading celebrations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Birthdays Tab */}
          {activeTab === 'birthdays' && (
            <div className="space-y-4">
              {birthdays.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold">{birthdays.length}</span> upcoming birthday
                    {birthdays.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={handleSendBulkBirthdays}
                    disabled={safeMessagingApiState.triggerBulkBirthday}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    <span>
                      {safeMessagingApiState.triggerBulkBirthday ? 'Sending...' : 'Send All'}
                    </span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {birthdays.length > 0 ? (
                  birthdays.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate">{member.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar size={14} className="text-slate-400" />
                              <p className="text-xs text-slate-500">
                                {member.dob
                                  ? formatDate(new Date(member.dob), 'MMM dd')
                                  : 'Date not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendBirthdayMessage(member.id)}
                          disabled={safeMessagingApiState.triggerBirthday}
                          className="p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          title="Send birthday message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <Cake size={16} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No upcoming birthdays</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Birthday messages will appear here when members have their date of birth set
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Anniversaries Tab */}
          {activeTab === 'anniversaries' && (
            <div className="space-y-4">
              {anniversaries.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold">{anniversaries.length}</span> upcoming
                    anniversar{anniversaries.length !== 1 ? 'ies' : 'y'}
                  </p>
                  <button
                    onClick={handleSendBulkAnniversaries}
                    disabled={safeMessagingApiState.triggerBulkAnniversary}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    <span>
                      {safeMessagingApiState.triggerBulkAnniversary ? 'Sending...' : 'Send All'}
                    </span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {anniversaries.length > 0 ? (
                  anniversaries.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate">{member.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar size={14} className="text-slate-400" />
                              <p className="text-xs text-slate-500">
                                {member.anniversary
                                  ? formatDate(new Date(member.anniversary), 'MMM dd')
                                  : 'Date not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendAnniversaryMessage(member.id)}
                          disabled={safeMessagingApiState.triggerAnniversary}
                          className="p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          title="Send anniversary message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <Heart size={16} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No upcoming anniversaries</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Anniversary messages will appear here when members have their anniversary date
                      set
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
