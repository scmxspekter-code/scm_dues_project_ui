// Error Types
export interface ApiError {
  message: string;
  status: number;
  error?: string;
}

// Type Guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string' &&
    'status' in error &&
    typeof (error as ApiError).status === 'number'
  );
}

// Message Types
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export type MessageChannel = 'whatsapp' | 'sms' | 'email';

export type MessageType = 'dues_reminder' | 'announcement' | 'birthday' | 'anniversary';

// Announcement Types
export type AnnouncementType = 'announcement' | 'notice' | 'custom';

export type AnnouncementTargetType = 'all' | 'defaulters' | 'paid' | 'custom';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export type AnnouncementChannel = 'sms' | 'whatsapp';

// Enums
export enum Currency {
  NGN = 'NGN',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum ReminderFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum PaymentProvider {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
}

export enum PaymentLinkStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

// Base Types
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

export interface IApiBaseResponse<T> {
  data?: T;
  meta?: PaginationMeta;
  error?: string;
  message?: string;
  accessToken?: string;
  accessTokenExpires?: number;
}

export interface IApiParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'processing' | 'paid' | 'failed';
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

// Payment Link Types
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

// Member/Collection Types
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
  paymentLink?: PaymentLink;
  [key: string]: unknown;
}

// Message Log Types
export interface MessageLog {
  id: string;
  collectionId: string;
  messageType: MessageType;
  channel: MessageChannel;
  recipientPhone: string;
  recipientName: string;
  content: string;
  status: MessageStatus;
  externalId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  collection?: Member;
}

// Payment Record Types
export interface PaymentRecord {
  id: string;
  collectionId: string;
  paymentLinkId: string;
  provider: PaymentProvider;
  providerReference: string;
  providerEventId: string | null;
  amount: number;
  currency: Currency;
  payerEmail: string;
  payerName: string;
  paymentMethod: string;
  paymentDate: string;
  status: 'successful' | 'failed' | 'pending';
  fee: number;
  rawWebhookData: Record<string, unknown>;
  createdAt: string;
  [key: string]: unknown;
}

// Collection History Types
export type CollectionHistoryItemType =
  | 'collection_created'
  | 'collection_updated'
  | 'message'
  | 'payment';

export interface CollectionHistoryItem {
  type: CollectionHistoryItemType;
  timestamp: string;
  data: Member | MessageLog | PaymentRecord | Record<string, unknown>;
}

export interface CollectionHistory {
  collection: Member;
  timeline: CollectionHistoryItem[];
}

// Stats Types
export interface DefaultersStats {
  total: number;
  totalAmount: number;
  byStatus: {
    pending: number;
    failed: number;
  };
  averageDaysOverdue: number;
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

export interface DashboardStats {
  collections: CollectionsStats;
  recentPayments: PaymentRecord[];
  recentReminders: MessageLog[];
  messageDeliveryRates: MessageDeliveryStats;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  scheduledFor: string | null;
  sentAt: string | null;
  targetType: AnnouncementTargetType;
  targetCollectionIds: string[] | null;
  channel: AnnouncementChannel;
  status: AnnouncementStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Bulk Message Response
export interface BulkMessageResponse {
  total: number;
  sent: number;
  failed: number;
  messageLogs: MessageLog[];
}

// Payload Types
export interface ICreateMemberPayload {
  name: string;
  phoneNumber: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  paymentStatus: PaymentStatus;
  reminderFrequency: ReminderFrequency;
}

export interface UpdateMemberPayload {
  name?: string;
  phoneNumber?: string;
  amount?: number;
  currency?: Currency;
  dueDate?: string;
  paymentStatus?: PaymentStatus;
  reminderFrequency?: ReminderFrequency;
  dob?: string | null;
  anniversary?: string | null;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  type: AnnouncementType;
  scheduledFor?: string | null;
  targetType: AnnouncementTargetType;
  targetCollectionIds?: string[] | null;
  channel: AnnouncementChannel;
  status?: AnnouncementStatus;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  scheduledFor?: string | null;
  targetType?: AnnouncementTargetType;
  targetCollectionIds?: string[] | null;
  channel?: AnnouncementChannel;
  status?: AnnouncementStatus;
}

export interface CreatePaymentLinksBulkPayload {
  collectionIds: string[];
}

export interface TriggerBirthdayPayload {
  collectionId: string;
}

export interface TriggerAnniversaryPayload {
  collectionId: string;
}

// Message Log Params
export interface MessageLogParams {
  page?: number;
  limit?: number;
  search?: string;
  collectionId?: string;
  channel?: MessageChannel;
  status?: MessageStatus;
  messageType?: MessageType;
}

// Export Params
export interface ExportParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Report Params
export interface PaymentsReportParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: 'successful' | 'failed' | 'pending';
}

export interface RemindersReportParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  channel?: MessageChannel;
  status?: MessageStatus;
}

export interface MessagesReportParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  channel?: MessageChannel;
  messageType?: MessageType;
}

export interface DefaultersReportParams extends IApiParams {
  sortBy?: 'amount' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
