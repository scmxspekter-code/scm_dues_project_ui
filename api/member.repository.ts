import {
  Member,
  IApiBaseResponse,
  IApiParams,
  ICreateMemberPayload,
  UpdateMemberPayload,
  PaymentLink,
  MessageLog,
  DefaultersStats,
  CollectionsStats,
  CollectionHistory,
  PaymentRecord,
  CreatePaymentLinksBulkPayload,
} from '@/types';
import { customFetch } from '@/utils/customFetch';

export default () => {
  return {
    createMember: (payload: ICreateMemberPayload[]): Promise<IApiBaseResponse<Member[]>> => {
      return customFetch('/collections', {
        method: 'POST',
        data: { collections: [...payload] },
      });
    },
    getMembers: (params: IApiParams): Promise<IApiBaseResponse<Member[]>> => {
      return customFetch('/collections', {
        method: 'GET',
        params,
      });
    },
    updateMember: (
      id: string,
      payload: UpdateMemberPayload
    ): Promise<IApiBaseResponse<Member[]>> => {
      // The collections update endpoint supports bulk updates via a "collections" array.
      // For the edit modal (single update) we still call it with a single-item array.
      return customFetch('/collections', {
        method: 'PATCH',
        data: {
          collections: [
            {
              id,
              ...payload,
            },
          ],
        },
      });
    },
    deleteMember: (id: string): Promise<IApiBaseResponse<void>> => {
      return customFetch(`/collections/${id}`, {
        method: 'DELETE',
      });
    },
    sendReminder: (
      id: string,
      channel: 'sms' | 'whatsapp'
    ): Promise<IApiBaseResponse<MessageLog>> => {
      return customFetch(`/collections/${id}/send-reminder`, {
        method: 'POST',
        params: { channel },
      });
    },
    sendRemindersBulk: (
      channel: 'sms' | 'whatsapp'
    ): Promise<IApiBaseResponse<{ total: number; sent: number; failed: number }>> => {
      return customFetch('/collections/send-reminders', {
        method: 'POST',
        params: { channel },
      });
    },
    getDefaultersStats: (): Promise<IApiBaseResponse<DefaultersStats>> => {
      return customFetch('/collections/defaulters/stats', {
        method: 'GET',
      });
    },
    markAsDefaulted: (id: string): Promise<IApiBaseResponse<Member>> => {
      return customFetch(`/collections/${id}/mark-defaulted`, {
        method: 'POST',
      });
    },
    getCollectionStats: (): Promise<IApiBaseResponse<CollectionsStats>> => {
      return customFetch('/collections/stats', {
        method: 'GET',
      });
    },
    getReminderHistory: (
      id: string,
      params: IApiParams
    ): Promise<IApiBaseResponse<MessageLog[]>> => {
      return customFetch(`/collections/${id}/reminder-history`, {
        method: 'GET',
        params,
      });
    },
    getCollectionHistory: (id: string): Promise<IApiBaseResponse<CollectionHistory>> => {
      return customFetch(`/collections/${id}/history`, {
        method: 'GET',
      });
    },
    exportCollections: async (params: IApiParams): Promise<Blob> => {
      return customFetch<Blob>('/collections/export', {
        method: 'GET',
        params,
        responseType: 'blob',
      });
    },
    getPaymentLink: (id: string): Promise<IApiBaseResponse<PaymentLink>> => {
      return customFetch(`/collections/${id}/payment-link`, {
        method: 'GET',
      });
    },
    createPaymentLink: (id: string): Promise<IApiBaseResponse<PaymentLink>> => {
      return customFetch(`/collections/${id}/payment-link`, {
        method: 'POST',
      });
    },
    createPaymentLinksBulk: (
      payload: CreatePaymentLinksBulkPayload
    ): Promise<IApiBaseResponse<PaymentLink[]>> => {
      return customFetch('/collections/payment-links', {
        method: 'POST',
        data: payload,
      });
    },
    getCollectionPayments: (id: string): Promise<IApiBaseResponse<PaymentRecord[]>> => {
      return customFetch(`/collections/${id}/payments`, {
        method: 'GET',
      });
    },
    markAsPaid: (id: string): Promise<IApiBaseResponse<Member>> => {
      return customFetch(`/collections/${id}/mark-paid`, {
        method: 'POST',
      });
    },
    getBirthdays: (params?: {
      page?: number;
      limit?: number;
    }): Promise<IApiBaseResponse<Member[]>> => {
      return customFetch('/collections/birthdays', {
        method: 'GET',
        params,
      });
    },
    getAnniversaries: (params?: {
      page?: number;
      limit?: number;
    }): Promise<IApiBaseResponse<Member[]>> => {
      return customFetch('/collections/anniversaries', {
        method: 'GET',
        params,
      });
    },
  };
};
