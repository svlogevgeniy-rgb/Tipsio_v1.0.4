"use client";

import { useCallback, useEffect, useState } from "react";
import type { DistributionMode } from "@/types/distribution";

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

const DASHBOARD_ENDPOINT = "/api/venues/dashboard";
const DASHBOARD_ERROR_MESSAGE = "Failed to load dashboard";

export function useDashboardData({
  period,
  onUnauthorized,
}: UseDashboardDataOptions) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${DASHBOARD_ENDPOINT}?period=${period}`);
      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(DASHBOARD_ERROR_MESSAGE);
      }

      const result: DashboardData = await response.json();
      setData(result);
    } catch {
      setError(DASHBOARD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized, period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    loading,
    data,
    error,
    refresh: fetchDashboard,
  };
}
