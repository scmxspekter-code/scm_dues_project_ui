import {
  IApiBaseResponse,
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  BulkMessageResponse,
  IApiParams,
} from '@/types';
import { customFetch } from '@/utils/customFetch';

export default () => {
  return {
    createAnnouncement: (
      payload: CreateAnnouncementPayload
    ): Promise<IApiBaseResponse<Announcement>> => {
      return customFetch('/announcements', {
        method: 'POST',
        data: payload,
      });
    },
    getAnnouncements: (params: IApiParams): Promise<IApiBaseResponse<Announcement[]>> => {
      return customFetch('/announcements', {
        method: 'GET',
        params,
      });
    },
    getAnnouncementById: (id: string): Promise<IApiBaseResponse<Announcement>> => {
      return customFetch(`/announcements/${id}`, {
        method: 'GET',
      });
    },
    updateAnnouncement: (
      id: string,
      payload: UpdateAnnouncementPayload
    ): Promise<IApiBaseResponse<Announcement>> => {
      return customFetch(`/announcements/${id}`, {
        method: 'PATCH',
        data: payload,
      });
    },
    sendAnnouncement: (id: string): Promise<IApiBaseResponse<BulkMessageResponse>> => {
      return customFetch(`/announcements/${id}/send`, {
        method: 'POST',
      });
    },
    deleteAnnouncement: (id: string): Promise<IApiBaseResponse<void>> => {
      return customFetch(`/announcements/${id}`, {
        method: 'DELETE',
      });
    },
  };
};
