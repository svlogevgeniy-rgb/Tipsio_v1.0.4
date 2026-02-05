'use client';

import { useState, useEffect } from 'react';
import { Loader2, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type QrType = 'INDIVIDUAL' | 'TEAM';

type StaffMember = {
  id: string;
  displayName: string;
  status: string;
  avatarUrl: string | null;
  role: string;
};

interface CreateQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
  onSuccess: () => void;
}

export function CreateQrDialog({
  open,
  onOpenChange,
  venueId,
  onSuccess,
}: CreateQrDialogProps) {
  const t = useTranslations('venue.qr');
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [qrType, setQrType] = useState<QrType>('INDIVIDUAL');
  const [label, setLabel] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff when dialog opens
  useEffect(() => {
    if (open && venueId) {
      const fetchStaff = async () => {
        setIsLoadingStaff(true);
        try {
          const response = await fetch(`/api/staff?venueId=${venueId}`);
          if (response.ok) {
            const data = await response.json();
            setStaff(data.staff || []);
          }
        } catch (err) {
          console.error('Failed to fetch staff:', err);
        } finally {
          setIsLoadingStaff(false);
        }
      };
      fetchStaff();
    }
  }, [open, venueId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('type');
      setQrType('INDIVIDUAL');
      setLabel('');
      setSelectedStaffId('');
      setSelectedStaffIds([]);
      setError(null);
    }
  }, [open]);

  const handleTypeSelect = (type: QrType) => {
    setQrType(type);
    setStep('details');
  };

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleCreate = async () => {
    setError(null);

    // Validation
    if (!label.trim()) {
      setError(t('enterQrName'));
      return;
    }

    if (qrType === 'INDIVIDUAL' && !selectedStaffId) {
      setError(t('selectEmployee'));
      return;
    }

    if (qrType === 'TEAM' && selectedStaffIds.length < 2) {
      setError(t('selectMin2Employees'));
      return;
    }

    setIsLoading(true);

    try {
      const payload =
        qrType === 'INDIVIDUAL'
          ? {
              type: 'INDIVIDUAL',
              label: label.trim(),
              venueId,
              staffId: selectedStaffId,
            }
          : {
              type: 'TEAM',
              label: label.trim(),
              venueId,
              recipientStaffIds: selectedStaffIds,
            };

      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create QR code');
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to create QR:', err);
      setError(err instanceof Error ? err.message : t('failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const activeStaff = staff.filter((s) => s.status === 'ACTIVE');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createQr')}</DialogTitle>
          <DialogDescription>
            {step === 'type'
              ? t('selectType')
              : t('fillDetails')}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="grid gap-4 py-4">
            <button
              onClick={() => handleTypeSelect('INDIVIDUAL')}
              className="p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">{t('individualQr')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('individualQrDesc')}
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelect('TEAM')}
              className="p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">{t('teamQr')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('teamQrDesc')}
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4 py-4">
            {/* Label Input */}
            <div className="space-y-2">
              <Label htmlFor="label">{t('qrLabel')}</Label>
              <Input
                id="label"
                placeholder={t('qrLabelPlaceholder')}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {/* Staff Selection */}
            {isLoadingStaff ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : qrType === 'INDIVIDUAL' ? (
              <div className="space-y-2">
                <Label>{t('selectStaff')}</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {activeStaff.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedStaffId(member.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedStaffId === member.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{member.displayName}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t('selectStaffMin2')}</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {activeStaff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`staff-${member.id}`}
                        checked={selectedStaffIds.includes(member.id)}
                        onCheckedChange={() => handleStaffToggle(member.id)}
                      />
                      <label
                        htmlFor={`staff-${member.id}`}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{member.displayName}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('selected')}: {selectedStaffIds.length}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('type')}
                disabled={isLoading}
                className="flex-1"
              >
                {t('back')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
