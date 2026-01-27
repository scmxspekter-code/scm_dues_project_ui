

export interface ReminderHistory {
  id: string;
  date: string;
  content: string;
  status: 'Delivered' | 'Failed';
  type: 'WhatsApp' | 'SMS';
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PaymentStatus;
  lastPaymentDate?: string;
  amountDue: number;
  joinedDate: string;
  reminderHistory?: ReminderHistory[];
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  reference: string;
  channel: 'WhatsApp' | 'Bank Transfer' | 'Portal';
}

export interface MessageLog {
  id: string;
  recipient: string;
  content: string;
  type: 'SMS' | 'WhatsApp';
  status: 'Sent' | 'Delivered' | 'Failed';
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  pageCount: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
}

export interface IApiBaseResponse<T>{
  data?: T;
  meta?: PaginationMeta;
  error?: string;
  message?: string;
  accessToken?: string;
  accessTokenExpires?: number;
}

export interface IApiParams{
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'processing'|'paid'|'failed';
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}


export enum Currency {
  NGN = "NGN"
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed"
}

export enum ReminderFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export enum PaymentProvider {
  PAYSTACK = "paystack",
  FLUTTERWAVE = "flutterwave"
}

export enum PaymentLinkStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  DISABLED = "disabled"
}


export interface PaymentLink {
  id: string;
  collectionId: string;
  provider: PaymentProvider;
  providerLinkId: string;
  linkUrl: string;
  amount: number;
  currency: Currency;
  status: PaymentLinkStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  amount: number;
  currency: Currency;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  reminderFrequency: ReminderFrequency;
  dueDate: string; // ISO or YYYY-MM-DD
  dob: string | null;
  anniversary: string | null;
  createdById: string;
  paymentLinkId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  paymentLink: PaymentLink;
}

export interface DashboardStats {
  collections: CollectionsStats;
  recentPayments: [];
  recentReminders:[];
  messageDeliveryRates: MessageDeliveryStats;
}

export interface CollectionsStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  defaulters: number;
  totalAmountCollected: number;
  totalAmountPending: number;
  totalAmountFailed: number;
}

export interface MessageDeliveryStats {
  sent: number;
  delivered: number;
  failed: number;
  total: number;
}


export  interface ICreateMemberPayload{
  name: string;
  phoneNumber: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  paymentStatus: PaymentStatus;
  reminderFrequency: ReminderFrequency;
}