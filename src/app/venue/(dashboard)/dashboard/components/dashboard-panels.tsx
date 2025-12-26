"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, History, Users } from "lucide-react";

export interface MetricCardConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
}

interface MetricsGridProps {
  metrics: MetricCardConfig[];
  isPooledMode: boolean;
}

export function MetricsGrid({ metrics, isPooledMode }: MetricsGridProps) {
  return (
    <div
      className={`grid gap-4 ${
        isPooledMode ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {metrics.map((metric) => (
        <Card key={metric.id} className="glass p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <metric.icon className="h-4 w-4" />
            <span className="text-xs">{metric.label}</span>
          </div>
          <div className="text-xl font-bold">{metric.value}</div>
        </Card>
      ))}
    </div>
  );
}

interface AlertCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onAction: () => void;
  variant: "info" | "warning";
}

export function NoStaffAlert({
  title,
  description,
  ctaLabel,
  onAction,
}: Omit<AlertCardProps, "variant">) {
  return (
    <Card className="glass p-4 border-primary/30 bg-primary/10">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <Button size="sm" onClick={onAction}>
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}

export function PendingPayoutsAlert({
  title,
  description,
  ctaLabel,
  onAction,
}: Omit<AlertCardProps, "variant">) {
  return (
    <Card className="glass p-4 border-yellow-500/30 bg-yellow-500/10">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <Button size="sm" onClick={onAction}>
          {ctaLabel}
        </Button>
      </div>
    </Card>
  );
}

export interface TipHistoryEntry {
  id: string;
  dateLabel: string;
  amountLabel: string;
}

interface TipHistoryCardProps {
  title: string;
  emptyMessage: string;
  entries?: TipHistoryEntry[];
  fallback?: ReactNode;
}

export function TipHistoryCard({
  title,
  emptyMessage,
  entries,
  fallback,
}: TipHistoryCardProps) {
  const hasEntries = entries && entries.length > 0;

  return (
    <Card className="glass p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {hasEntries ? (
        <div className="space-y-3">
          {entries!.map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
            >
              <div className="text-sm text-muted-foreground">{tip.dateLabel}</div>
              <div className="font-semibold text-primary">{tip.amountLabel}</div>
            </div>
          ))}
        </div>
      ) : (
        fallback ?? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        )
      )}
    </Card>
  );
}

export interface TopStaffEntry {
  id: string;
  name: string;
  tipsCountLabel: string;
  totalTipsLabel: string;
}

interface TopStaffCardProps {
  title: string;
  emptyMessage: string;
  staff: TopStaffEntry[];
}

export function TopStaffCard({
  title,
  emptyMessage,
  staff,
}: TopStaffCardProps) {
  return (
    <Card className="glass p-4">
      <h2 className="font-semibold mb-4">{title}</h2>
      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {staff.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.tipsCountLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">
                  {member.totalTipsLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
