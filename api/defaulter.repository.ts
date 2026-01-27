import { Member, IApiBaseResponse } from '@/types';
import { customFetch } from '@/utils/customFetch';
export interface IReportParams {
  page?: number;
  limit?: number;
  search?: string;
}
export default () => {
  return {
    getDefaulters: (params: IReportParams): Promise<IApiBaseResponse<Member[]>> => {
      return customFetch('/dashboard/reports/defaulters', {
        method: 'GET',
        params,
      });
    },
  };
};
