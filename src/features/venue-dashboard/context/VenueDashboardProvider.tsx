'use client';

import { createContext, useState, useCallback, useRef } from 'react';
import { DEFAULT_DASHBOARD_PERIOD } from '../constants';
import type { VenueDashboardData } from '../api/getVenueDashboard';
import type { DashboardPeriod } from '../constants';

/**
 * Context value for venue dashboard
 */
export interface VenueDashboardContextValue {
  data: VenueDashboardData | null;
  period: DashboardPeriod;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: DashboardPeriod) => void;
  refresh: () => Promise<void>;
}

/**
 * Props for VenueDashboardProvider
 */
export interface VenueDashboardProviderProps {
  children: React.ReactNode;
  initialData: VenueDashboardData | null;
  initialPeriod?: DashboardPeriod;
  initialError?: string | null;
}

export const VenueDashboardContext = createContext<VenueDashboardContextValue | null>(null);

/**
 * Provider for venue dashboard data
 * Manages shared state for all dashboard pages
 */
export function VenueDashboardProvider({
  children,
  initialData,
  initialPeriod = DEFAULT_DASHBOARD_PERIOD,
  initialError = null,
}: VenueDashboardProviderProps) {
  const [data, setData] = useState<VenueDashboardData | null>(initialData);
  const [period, setPeriodState] = useState<DashboardPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  
  // Track in-flight requests to prevent duplicates
  const inFlightRef = useRef<string | null>(null);

  /**
   * Fetch dashboard data for a specific period
   */
  const fetchData = useCallback(async (newPeriod: DashboardPeriod) => {
    // Prevent duplicate in-flight requests
    if (inFlightRef.current === newPeriod) {
      return;
    }

    inFlightRef.current = newPeriod;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/venues/dashboard?period=${newPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      // Keep previous data on error
    } finally {
      setIsLoading(false);
      inFlightRef.current = null;
    }
  }, []);

  /**
   * Change the current period and fetch new data
   */
  const setPeriod = useCallback(
    (newPeriod: DashboardPeriod) => {
      setPeriodState(newPeriod);
      fetchData(newPeriod);
    },
    [fetchData]
  );

  /**
   * Refresh data for the current period
   */
  const refresh = useCallback(() => {
    return fetchData(period);
  }, [fetchData, period]);

  const value: VenueDashboardContextValue = {
    data,
    period,
    isLoading,
    error,
    setPeriod,
    refresh,
  };

  return (
    <VenueDashboardContext.Provider value={value}>
      {children}
    </VenueDashboardContext.Provider>
  );
}
