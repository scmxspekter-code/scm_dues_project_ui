import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  MessageLog,
  MessageLogParams,
  BulkMessageResponse,
  TriggerBirthdayPayload,
  TriggerAnniversaryPayload,
  isApiError,
  IApiParams,
  AnnouncementTargetType,
  AnnouncementType,
  AnnouncementStatus,
  Member,
} from '../types';
import { $api } from '@/api';
import toast from 'react-hot-toast';
import { debounce } from '@/utils/debounce';

export type RecipientType = 'defaulters' | 'paid' | 'all' | 'custom';
export type Channel = 'whatsapp' | 'sms';

export const useMessaging = () => {
  const [recipientType, setRecipientType] = useState<RecipientType>('defaulters');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'compose' | 'announcements' | 'history'>('compose');
  const [messageHistory, setMessageHistory] = useState<MessageLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<Member[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [memberSearchDropdownOpen, setMemberSearchDropdownOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [apiState, setApiState] = useState({
    sendAnnouncement: false,
    getAnnouncements: false,
    createAnnouncement: false,
    updateAnnouncement: false,
    deleteAnnouncement: false,
    getMessageLogs: false,
    triggerBirthday: false,
    triggerAnniversary: false,
    triggerBulkBirthday: false,
    triggerBulkAnniversary: false,
  });

  const isMountedRef = useRef(true);

  // Clear selected member when switching away from Specific Member
  useEffect(() => {
    if (recipientType !== 'custom') {
      setSelectedMember(null);
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      setMemberSearchDropdownOpen(false);
    }
  }, [recipientType]);

  const getMembersForSearch = useCallback(async (search: string): Promise<void> => {
    if (!search.trim()) {
      setMemberSearchResults([]);
      return;
    }
    setIsSearchingMembers(true);
    try {
      const { data } = await $api.members.getMembers({
        search: search.trim(),
        page: 1,
        limit: 20,
      });
      setMemberSearchResults(data || []);
      setMemberSearchDropdownOpen(true);
    } catch {
      setMemberSearchResults([]);
    } finally {
      setIsSearchingMembers(false);
    }
  }, []);

  const debouncedGetMembersForSearch = useRef(
    debounce((q: string) => getMembersForSearch(q), 300)
  ).current;

  useEffect(() => {
    if (recipientType === 'custom' && memberSearchQuery.trim()) {
      debouncedGetMembersForSearch(memberSearchQuery);
    } else {
      setMemberSearchResults([]);
    }
  }, [recipientType, memberSearchQuery, debouncedGetMembersForSearch]);

  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;

    const loadData = async (): Promise<void> => {
      // Load announcements
      if (isMounted) {
        setIsLoadingAnnouncements(true);
      }
      try {
        const announcementsData = await getAnnouncements({ page: 1, limit: 50 });
        if (isMounted) {
          setAnnouncements(announcementsData);
        }
      } catch {
        // Error already handled in hook
      } finally {
        if (isMounted) {
          setIsLoadingAnnouncements(false);
        }
      }

      // Load message history
      if (isMounted) {
        setIsLoadingHistory(true);
      }
      try {
        const data = await getMessageLogs({ page: 1, limit: 10 });
        if (isMounted) {
          setMessageHistory(data);
        }
      } catch {
        // Error already handled in hook
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSend = async (): Promise<void> => {
    if (!message.trim() || !title.trim()) {
      toast.error('Please provide both title and message content');
      return;
    }
    if (recipientType === 'custom' && !selectedMember) {
      toast.error('Please search and select a member');
      return;
    }

    setIsSending(true);
    try {
      const targetType: AnnouncementTargetType =
        recipientType === 'all'
          ? 'all'
          : recipientType === 'defaulters'
            ? 'defaulters'
            : recipientType === 'paid'
              ? 'paid'
              : 'custom';

      const announcement = await createAnnouncement({
        title,
        content: message,
        type: 'announcement' as AnnouncementType,
        targetType,
        targetCollectionIds:
          targetType === 'custom' && selectedMember ? [selectedMember.id] : undefined,
        channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        status: 'draft' as AnnouncementStatus,
      });

      if (announcement) {
        await sendAnnouncement(announcement.id);
        setMessage('');
        setTitle('');
        setSelectedMember(null);
        setMemberSearchQuery('');
        setMemberSearchResults([]);
        // Refresh data after sending
        try {
          const announcementsData = await getAnnouncements({ page: 1, limit: 50 });
          setAnnouncements(announcementsData);
          const data = await getMessageLogs({ page: 1, limit: 10 });
          setMessageHistory(data);
        } catch {
          // Error already handled in hook
        }
      }
    } catch {
      // Error already handled in hook
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    try {
      await deleteAnnouncement(id);
      const announcementsData = await getAnnouncements({ page: 1, limit: 50 });
      setAnnouncements(announcementsData);
    } catch {
      // Error already handled in hook
    }
  };

  const handleViewAnnouncement = async (id: string): Promise<void> => {
    try {
      const announcement = await getAnnouncementById(id);
      if (announcement) {
        setSelectedAnnouncement(announcement);
        setTitle(announcement.title);
        setMessage(announcement.content);
        setActiveTab('compose');
      }
    } catch {
      // Error already handled in hook
    }
  };

  const refreshHistory = async (): Promise<void> => {
    setIsLoadingHistory(true);
    try {
      const data = await getMessageLogs({ page: 1, limit: 10 });
      setMessageHistory(data);
    } catch {
      // Error already handled in hook
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const createAnnouncement = async (
    payload: CreateAnnouncementPayload
  ): Promise<Announcement | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, createAnnouncement: true }));
      const { data } = await $api.announcements.createAnnouncement(payload);
      toast.success('Announcement created successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to create announcement');
      } else {
        toast.error('Failed to create announcement');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, createAnnouncement: false }));
    }
  };

  const getAnnouncements = async (params: IApiParams): Promise<Announcement[]> => {
    try {
      setApiState((prev) => ({ ...prev, getAnnouncements: true }));
      const { data } = await $api.announcements.getAnnouncements(params);
      return data || [];
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch announcements');
      } else {
        toast.error('Failed to fetch announcements');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getAnnouncements: false }));
    }
  };

  const getAnnouncementById = async (id: string): Promise<Announcement | undefined> => {
    try {
      const { data } = await $api.announcements.getAnnouncementById(id);
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch announcement');
      } else {
        toast.error('Failed to fetch announcement');
      }
      throw error;
    }
  };

  const updateAnnouncement = async (
    id: string,
    payload: UpdateAnnouncementPayload
  ): Promise<Announcement | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, updateAnnouncement: true }));
      const { data } = await $api.announcements.updateAnnouncement(id, payload);
      toast.success('Announcement updated successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to update announcement');
      } else {
        toast.error('Failed to update announcement');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, updateAnnouncement: false }));
    }
  };

  const sendAnnouncement = async (id: string): Promise<BulkMessageResponse | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, sendAnnouncement: true }));
      const { data } = await $api.announcements.sendAnnouncement(id);
      toast.success('Announcement sent successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to send announcement');
      } else {
        toast.error('Failed to send announcement');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, sendAnnouncement: false }));
    }
  };

  const deleteAnnouncement = async (id: string): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, deleteAnnouncement: true }));
      await $api.announcements.deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to delete announcement');
      } else {
        toast.error('Failed to delete announcement');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, deleteAnnouncement: false }));
    }
  };

  const getMessageLogs = async (params: MessageLogParams): Promise<MessageLog[]> => {
    try {
      setApiState((prev) => ({ ...prev, getMessageLogs: true }));
      const { data } = await $api.messaging.getMessageLogs(params);
      return data || [];
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch message logs');
      } else {
        toast.error('Failed to fetch message logs');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getMessageLogs: false }));
    }
  };

  const triggerBirthdayMessage = async (
    payload: TriggerBirthdayPayload
  ): Promise<MessageLog | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, triggerBirthday: true }));
      const { data } = await $api.messaging.triggerBirthdayMessage(payload);
      toast.success('Birthday message triggered successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to trigger birthday message');
      } else {
        toast.error('Failed to trigger birthday message');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, triggerBirthday: false }));
    }
  };

  const triggerAnniversaryMessage = async (
    payload: TriggerAnniversaryPayload
  ): Promise<MessageLog | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, triggerAnniversary: true }));
      const { data } = await $api.messaging.triggerAnniversaryMessage(payload);
      toast.success('Anniversary message triggered successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to trigger anniversary message');
      } else {
        toast.error('Failed to trigger anniversary message');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, triggerAnniversary: false }));
    }
  };

  const triggerBulkBirthdayMessages = async (): Promise<BulkMessageResponse | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, triggerBulkBirthday: true }));
      const { data } = await $api.messaging.triggerBulkBirthdayMessages();
      toast.success('Bulk birthday messages triggered successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to trigger bulk birthday messages');
      } else {
        toast.error('Failed to trigger bulk birthday messages');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, triggerBulkBirthday: false }));
    }
  };

  const triggerBulkAnniversaryMessages = async (): Promise<BulkMessageResponse | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, triggerBulkAnniversary: true }));
      const { data } = await $api.messaging.triggerBulkAnniversaryMessages();
      toast.success('Bulk anniversary messages triggered successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to trigger bulk anniversary messages');
      } else {
        toast.error('Failed to trigger bulk anniversary messages');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, triggerBulkAnniversary: false }));
    }
  };

  return {
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
    selectedAnnouncement,
    selectedMember,
    setSelectedMember,
    memberSearchQuery,
    setMemberSearchQuery,
    memberSearchResults,
    isSearchingMembers,
    memberSearchDropdownOpen,
    setMemberSearchDropdownOpen,
    isLoadingHistory,
    isLoadingAnnouncements,
    isSending,
    handleSend,
    handleDeleteAnnouncement,
    handleViewAnnouncement,
    refreshHistory,
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    sendAnnouncement,
    deleteAnnouncement,
    getMessageLogs,
    triggerBirthdayMessage,
    triggerAnniversaryMessage,
    triggerBulkBirthdayMessages,
    triggerBulkAnniversaryMessages,
    apiState,
  };
};
