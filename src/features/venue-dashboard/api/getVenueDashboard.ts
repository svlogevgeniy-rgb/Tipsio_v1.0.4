import { headers } from 'next/headers';
import type { DistributionMode } from '@/types/distribution';
import { DEFAULT_DASHBOARD_PERIOD } from '../constants';
import type { DashboardPeriod } from '../constants';

/**
 * Venue dashboard data structure
 */
export interface VenueDashboardData {
  venue: {
    id: string;
    name: string;
    distributionMode: DistributionMode;
  };
  metrics: {
    totalTips: number;
    transactionCount: number;
    averageTip: number;
    activeStaff: number;
  };
  topStaff: Array<{
    id: string;
    displayName: string;
    totalTips: number;
    tipsCount: number;
  }>;
  hasPendingPayouts: boolean;
  recentTips?: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
}

/**
 * Get base URL for API requests
 * In server components, we need absolute URLs
 */
function getBaseUrl() {
  // In server components, use NEXTAUTH_URL or construct from headers
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  // Client-side
  return '';
}

/**
 * Fetch venue dashboard data from API
 * @param period - Time period for metrics (defaults to 'week')
 * @returns Dashboard data
 * @throws Error if fetch fails
 */
export async function getVenueDashboard(
  period: DashboardPeriod = DEFAULT_DASHBOARD_PERIOD
): Promise<VenueDashboardData> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/venues/dashboard?period=${period}`;
  
  // Get headers for server-side requests to pass cookies
  const requestHeaders: HeadersInit = {};
  if (typeof window === 'undefined') {
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    if (cookie) {
      requestHeaders['cookie'] = cookie;
    }
  }
  
  const response = await fetch(url, {
    cache: 'no-store', // Disable caching for server components
    credentials: 'include', // Include cookies for auth
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch venue dashboard');
  }

  return response.json();
}
