'use client';

import { useEffect } from 'react';
import type { DashboardPeriod } from '@/features/venue-dashboard/constants';
import { useVenueDashboard } from '@/features/venue-dashboard/hooks/useVenueDashboard';
import type { DistributionMode } from '@/types/distribution';

export interface DashboardData {
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

interface UseDashboardDataOptions {
  period: string;
  onUnauthorized: () => void;
}

/**
 * Hook to access dashboard data from shared context
 * Maintains backward compatibility with existing interface
 */
export function useDashboardData({
  period,
  onUnauthorized,
}: UseDashboardDataOptions) {
  const {
    data: contextData,
    isLoading,
    error: contextError,
    period: currentPeriod,
    setPeriod,
    refresh,
  } = useVenueDashboard();

  // Update period when it changes
  useEffect(() => {
    if (period !== currentPeriod) {
      setPeriod(period as DashboardPeriod);
    }
  }, [period, currentPeriod, setPeriod]);

  // Handle unauthorized (401) - check if error indicates auth issue
  useEffect(() => {
    if (contextError && contextError.includes('401')) {
      onUnauthorized();
    }
  }, [contextError, onUnauthorized]);

  return {
    loading: isLoading,
    data: contextData,
    error: contextError,
    refresh,
  };
}
