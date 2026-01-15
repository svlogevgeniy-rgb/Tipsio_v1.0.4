/**
 * Constants for venue dashboard feature
 */

export const DEFAULT_DASHBOARD_PERIOD = 'week' as const;

export const DASHBOARD_PERIODS = ['today', 'week', 'month'] as const;

export type DashboardPeriod = typeof DASHBOARD_PERIODS[number];
