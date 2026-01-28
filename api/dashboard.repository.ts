import { customFetch } from '@/utils/customFetch';
import { IApiBaseResponse } from '@/types';
import { DashboardStats, Member } from '@/types';
interface IReportParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}
interface IMessageReportParams {
  page?: number;
  limit?: number;
  channel?: 'whatsapp' | 'sms';
  status?: string;
}
export default () => {
  return {
    stats(): Promise<IApiBaseResponse<DashboardStats>> {
      return customFetch('/dashboard/stats', { method: 'GET' });
    },
    paymentsReport(params: IReportParams): Promise<IApiBaseResponse<Member[]>> {
      return customFetch('/dashboard/reports/payments', { method: 'GET', params });
    },
    remindersReport(params: IReportParams): Promise<IApiBaseResponse<Member[]>> {
      return customFetch('/dashboard/reports/reminders', { method: 'GET', params });
    },
    messagesReport(params: IMessageReportParams): Promise<IApiBaseResponse<unknown[]>> {
      return customFetch('/dashboard/reports/messages', { method: 'GET', params });
    },
    defaultersReport(params: IReportParams): Promise<IApiBaseResponse<Member[]>> {
      return customFetch('/dashboard/reports/defaulters', { method: 'GET', params });
    },
  };
};
