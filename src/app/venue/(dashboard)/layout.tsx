import { getVenueDashboard } from '@/features/venue-dashboard/api/getVenueDashboard';
import { DEFAULT_DASHBOARD_PERIOD } from '@/features/venue-dashboard/constants';
import { VenueDashboardProvider } from '@/features/venue-dashboard/context/VenueDashboardProvider';
import { VenueLayoutClient } from './VenueLayoutClient';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

/**
 * Server layout for venue dashboard
 * Fetches initial data on the server and provides it to client components
 */
export default async function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side fetch for initial data
  let initialData = null;
  let initialError = null;

  try {
    initialData = await getVenueDashboard(DEFAULT_DASHBOARD_PERIOD);
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : 'Failed to load dashboard';
    console.error('Failed to fetch venue dashboard:', error);
  }

  return (
    <VenueDashboardProvider
      initialData={initialData}
      initialPeriod={DEFAULT_DASHBOARD_PERIOD}
      initialError={initialError}
    >
      <VenueLayoutClient>{children}</VenueLayoutClient>
    </VenueDashboardProvider>
  );
}
