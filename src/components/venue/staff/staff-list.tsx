'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from '@/i18n/client';
import { formatNumber } from '@/lib/i18n/formatters';
import { StaffAvatar } from './staff-avatar';
import type { Staff } from './schema';

interface StaffListProps {
  staff: Staff[];
  roleLabels: Record<string, string>;
  onToggleStatus: (staffMember: Staff) => void;
  onDelete: (staffMember: Staff) => void;
  onEmptyAction?: () => void;
}

export function StaffList({ staff, roleLabels, onToggleStatus, onDelete, onEmptyAction }: StaffListProps) {
  const t = useTranslations('venue.staff');

  if (staff.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-heading font-bold mb-2">{t('noStaffYet')}</h3>
          <p className="text-muted-foreground mb-4">{t('noStaffDesc')}</p>
          <Button onClick={onEmptyAction} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            {t('addFirstStaff')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {staff.map((member) => (
        <Card key={member.id} className="glass">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <StaffAvatar staff={member} />
                <div>
                  <CardTitle className="font-heading">{member.displayName}</CardTitle>
                  <CardDescription>
                    {roleLabels[member.role] || member.role} • {member.qrCode?.shortCode || 'No QR'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {member.status === 'ACTIVE' ? t('active') : t('inactive')}
                </span>
                <Button variant="outline" size="sm" onClick={() => onToggleStatus(member)}>
                  {member.status === 'ACTIVE' ? t('deactivate') : t('activate')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(member)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>💰 {member._count?.tips || 0} {t('tipsCount')}</span>
              <span>
                📊 {t('totalEarned')}: Rp {formatNumber(member.totalTips || 0)}
              </span>
              {(member.balance || 0) > 0 && (
                <span className="text-primary font-medium">
                  💵 {t('balance')}: Rp {formatNumber(member.balance || 0)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
