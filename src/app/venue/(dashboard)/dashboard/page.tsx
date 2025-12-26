"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Users, Banknote } from "lucide-react";
import {
  MetricsGrid,
  NoStaffAlert,
  PendingPayoutsAlert,
  TipHistoryCard,
  TopStaffCard,
} from "./components/dashboard-panels";
import type {
  MetricCardConfig,
  TipHistoryEntry,
  TopStaffEntry,
} from "./components/dashboard-panels";
import { formatCurrencyIDRIntl, formatDateTimeShort } from "@/lib/i18n/formatters";
import { useDashboardData } from "./use-dashboard-data";
import { isPooledMode } from "@/types/distribution";

export default function VenueDashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("week");
  const t = useTranslations("venue.dashboard");
  const tc = useTranslations("common");

  const { loading, data, error, refresh } = useDashboardData({
    period,
    onUnauthorized: () => router.push("/venue/login"),
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="glass p-6 text-center">
          <p className="text-muted-foreground">{error || tc("error")}</p>
          <Button onClick={refresh} className="mt-4">
            {tc("retry")}
          </Button>
        </Card>
      </div>
    );
  }

  const isPooled = isPooledMode(data.venue.distributionMode);

  const metrics: MetricCardConfig[] = [
    {
      id: "totalTips",
      icon: Banknote,
      label: t("totalTips"),
      value: formatCurrencyIDRIntl(data.metrics.totalTips),
    },
    {
      id: "transactions",
      icon: TrendingUp,
      label: t("transactions"),
      value: data.metrics.transactionCount,
    },
    {
      id: "averageTip",
      icon: Banknote,
      label: t("averageTip"),
      value: formatCurrencyIDRIntl(data.metrics.averageTip),
    },
  ];

  if (!isPooled) {
    metrics.push({
      id: "activeStaff",
      icon: Users,
      label: t("activeStaff"),
      value: data.metrics.activeStaff,
    });
  }

  const recentTipEntries: TipHistoryEntry[] =
    data.recentTips?.map((tip) => ({
      id: tip.id,
      dateLabel: formatDateTimeShort(tip.createdAt),
      amountLabel: formatCurrencyIDRIntl(tip.amount),
    })) ?? [];

  const topStaffEntries: TopStaffEntry[] = data.topStaff.map((staff) => ({
    id: staff.id,
    name: staff.displayName,
    tipsCountLabel: `${staff.tipsCount} ${t("tips")}`,
    totalTipsLabel: formatCurrencyIDRIntl(staff.totalTips),
  }));

  const pooledHasTipData = data.topStaff.length > 0;
  const pooledEntries = pooledHasTipData ? recentTipEntries : undefined;
  const showPooledFallback =
    pooledHasTipData && recentTipEntries.length === 0;
  const pooledFallback = showPooledFallback ? (
    <div className="text-center py-4">
      <div className="text-2xl font-bold text-primary mb-2">
        {formatCurrencyIDRIntl(data.metrics.totalTips)}
      </div>
      <div className="text-sm text-muted-foreground">
        {t("transactionsInPeriod", { count: data.metrics.transactionCount })}
      </div>
    </div>
  ) : undefined;

  const showNoStaffAlert = !isPooled && data.metrics.activeStaff === 0;
  const showPendingPayoutsAlert =
    !isPooled && data.hasPendingPayouts && data.metrics.activeStaff > 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">
          {data.venue.name} — {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-40 bg-white/5 border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">{t("today")}</SelectItem>
          <SelectItem value="week">{t("thisWeek")}</SelectItem>
          <SelectItem value="month">{t("thisMonth")}</SelectItem>
        </SelectContent>
      </Select>

      <MetricsGrid metrics={metrics} isPooledMode={isPooled} />

      {showNoStaffAlert && (
        <NoStaffAlert
          title={t("addStaff")}
          description={t("addStaffDesc")}
          ctaLabel={t("add")}
          onAction={() => router.push("/venue/staff")}
        />
      )}

      {showPendingPayoutsAlert && (
        <PendingPayoutsAlert
          title={t("pendingPayouts")}
          description={t("pendingPayoutsDesc")}
          ctaLabel={t("goToPayouts")}
          onAction={() => router.push("/venue/payouts")}
        />
      )}

      {isPooled ? (
        <TipHistoryCard
          title={t("tipHistory")}
          emptyMessage={t("noTipsYet")}
          entries={pooledEntries}
          fallback={pooledFallback}
        />
      ) : (
        <>
          <TopStaffCard
            title={t("topPerformers")}
            emptyMessage={t("noTipsYet")}
            staff={topStaffEntries}
          />

          <TipHistoryCard
            title={t("tipHistory")}
            emptyMessage={t("noTipsYet")}
            entries={recentTipEntries.length > 0 ? recentTipEntries : undefined}
          />
        </>
      )}
    </div>
  );
}
