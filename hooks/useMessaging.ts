import { useState } from 'react';
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
} from '../types';
import { $api } from '@/api';
import toast from 'react-hot-toast';

export type RecipientType = 'defaulters' | 'paid' | 'all' | 'custom';
export type Channel = 'whatsapp' | 'sms';

export const useMessaging = () => {
  const [recipientType, setRecipientType] = useState<RecipientType>('defaulters');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState('');
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

  const handleSend = (): void => {
    // TODO: Implement send logic using announcements API or bulk reminders
    // This function is not currently used
    void { recipientType, channel, message };
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
    handleSend,
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
