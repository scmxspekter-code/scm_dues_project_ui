
export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  DEFAULTER = 'DEFAULTER'
}

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
