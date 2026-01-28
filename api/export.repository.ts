import { ExportParams } from '@/types';
import { customFetch } from '@/utils/customFetch';

export default () => {
  return {
    exportCollections: async (params: ExportParams): Promise<Blob> => {
      return customFetch<Blob>('/exports/collections', {
        method: 'GET',
        params,
        responseType: 'blob',
      });
    },
    exportPayments: async (params: ExportParams): Promise<Blob> => {
      return customFetch<Blob>('/exports/payments', {
        method: 'GET',
        params,
        responseType: 'blob',
      });
    },
    exportMessages: async (params: ExportParams): Promise<Blob> => {
      return customFetch<Blob>('/exports/messages', {
        method: 'GET',
        params,
        responseType: 'blob',
      });
    },
    exportDefaulters: async (params: ExportParams): Promise<Blob> => {
      return customFetch<Blob>('/exports/defaulters', {
        method: 'GET',
        params,
        responseType: 'blob',
      });
    },
  };
};
