import AuthRepository from './auth.repository';
import MemberRepository from './member.repository';
import DashboardRepository from './dashboard.repository';
import MessagingRepository from './messaging.repository';
import PaymentsRepository from './payment.repository';
import DefaulterRepository from './defaulter.repository';
import SettingsRepository from './settings.repository';
import AnnouncementRepository from './announcement.repository';
import ExportRepository from './export.repository';

export const $api = {
  auth: AuthRepository(),
  dashboard: DashboardRepository(),
  members: MemberRepository(),
  defaulters: DefaulterRepository(),
  messaging: MessagingRepository(),
  payments: PaymentsRepository(),
  settings: SettingsRepository(),
  announcements: AnnouncementRepository(),
  exports: ExportRepository(),
};
