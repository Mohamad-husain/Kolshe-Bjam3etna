import type { AdminDashboard } from '@/hooks/admin/use-admin-dashboard';

import { ClubsSection } from './sections/ClubsSection';
import { NewsSection } from './sections/NewsSection';
import { OffersSection } from './sections/OffersSection';
import { OverviewSection } from './sections/OverviewSection';
import { RolesSection } from './sections/RolesSection';
import { UsersSection } from './sections/UsersSection';

type AdminDashboardSectionsProps = {
  adminDashboard: AdminDashboard;
};

export function AdminDashboardSections({ adminDashboard }: AdminDashboardSectionsProps) {
  switch (adminDashboard.resolvedActiveSection) {
    case 'overview':
      return <OverviewSection adminDashboard={adminDashboard} />;
    case 'users':
      return <UsersSection adminDashboard={adminDashboard} />;
    case 'news':
      return <NewsSection adminDashboard={adminDashboard} />;
    case 'roles':
      return <RolesSection adminDashboard={adminDashboard} />;
    case 'offers':
      return <OffersSection adminDashboard={adminDashboard} />;
    case 'clubs':
      return <ClubsSection adminDashboard={adminDashboard} />;
    default:
      return null;
  }
}
