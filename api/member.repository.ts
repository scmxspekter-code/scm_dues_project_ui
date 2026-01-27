import { Member, IApiBaseResponse, IApiParams } from '@/types';
import { customFetch } from '@/utils/customFetch';

export interface ICreateMemberPayload {
  name: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  paymentStatus: string;
  reminderFrequency: string;
}

export interface IMemberCreateResponse {
  name: string;
  phoneNumber: string;
  amount: number;
  currency: 'NGN';
  paymentStatus: 'pending' | 'completed' | 'failed';
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: string;
  createdById: string;
  paymentProvider: 'paystack' | 'flutterwave';
  paymentLinkId: string | null;
  id: string;
}
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
  };
};
