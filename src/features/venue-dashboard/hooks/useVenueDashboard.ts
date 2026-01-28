'use client';

import { useContext } from 'react';
import { VenueDashboardContext } from '../context/VenueDashboardProvider';

/**
 * Hook to access venue dashboard data from context
 * @throws Error if used outside VenueDashboardProvider
 * @returns Dashboard context value
 */
export function useVenueDashboard() {
  const context = useContext(VenueDashboardContext);

  if (!context) {
    throw new Error(
      'useVenueDashboard must be used within VenueDashboardProvider'
    );
  }

  return context;
}
