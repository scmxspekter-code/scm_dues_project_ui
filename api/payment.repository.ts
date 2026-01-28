import { IApiBaseResponse, PaymentRecord, IApiParams } from '@/types';
import { customFetch } from '@/utils/customFetch';

export default () => {
  return {
    getPayments(params?: IApiParams): Promise<IApiBaseResponse<PaymentRecord[]>> {
      return customFetch('/payments', {
        method: 'GET',
        params,
      });
    },
  };
};
