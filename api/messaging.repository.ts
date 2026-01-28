import {
  IApiBaseResponse,
  MessageLog,
  MessageLogParams,
  TriggerBirthdayPayload,
  TriggerAnniversaryPayload,
  BulkMessageResponse,
} from '@/types';
import { customFetch } from '@/utils/customFetch';

export default () => {
  return {
    getMessageHistory: (
      id: string,
      params?: { page?: number; limit?: number }
    ): Promise<IApiBaseResponse<MessageLog[]>> => {
      return customFetch(`/collections/${id}/reminder-history`, {
        method: 'GET',
        params,
      });
    },
    getMessageLogs: (params: MessageLogParams): Promise<IApiBaseResponse<MessageLog[]>> => {
      return customFetch('/message-logs', {
        method: 'GET',
        params,
      });
    },
    getMessageLogById: (id: string): Promise<IApiBaseResponse<MessageLog>> => {
      return customFetch(`/message-logs/${id}`, {
        method: 'GET',
      });
    },
    getMessageLogsByCollection: (collectionId: string): Promise<IApiBaseResponse<MessageLog[]>> => {
      return customFetch(`/message-logs/collection/${collectionId}`, {
        method: 'GET',
      });
    },
    triggerBirthdayMessage: (
      payload: TriggerBirthdayPayload
    ): Promise<IApiBaseResponse<MessageLog>> => {
      return customFetch('/messages/birthday', {
        method: 'POST',
        data: payload,
      });
    },
    triggerAnniversaryMessage: (
      payload: TriggerAnniversaryPayload
    ): Promise<IApiBaseResponse<MessageLog>> => {
      return customFetch('/messages/anniversary', {
        method: 'POST',
        data: payload,
      });
    },
    triggerBulkBirthdayMessages: (): Promise<IApiBaseResponse<BulkMessageResponse>> => {
      return customFetch('/messages/birthday/bulk', {
        method: 'POST',
      });
    },
    triggerBulkAnniversaryMessages: (): Promise<IApiBaseResponse<BulkMessageResponse>> => {
      return customFetch('/messages/anniversary/bulk', {
        method: 'POST',
      });
    },
  };
};
