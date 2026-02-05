'use client';

import { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
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

type StaffMember = {
  id: string;
  displayName: string;
  status: string;
  avatarUrl: string | null;
  role: string;
};

type QrCodeType = {
  id: string;
  type: string;
  label: string | null;
  shortCode: string;
  status: string;
  staff?: StaffMember | null;
  recipients?: StaffMember[];
};

interface EditTeamQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: QrCodeType;
  venueId: string;
  onSuccess: () => void;
}

export function EditTeamQrDialog({
  open,
  onOpenChange,
  qrCode,
  venueId,
  onSuccess,
}: EditTeamQrDialogProps) {
  const t = useTranslations('venue.qr');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected staff from qrCode recipients
  useEffect(() => {
    if (open && qrCode.recipients) {
      setSelectedStaffIds(qrCode.recipients.map((r) => r.id));
    }
  }, [open, qrCode]);

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
      setError(null);
    }
  }, [open]);

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleUpdate = async () => {
    setError(null);

    // Validation
    if (selectedStaffIds.length < 2) {
      setError(t('selectMin2Employees'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/qr/${qrCode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientStaffIds: selectedStaffIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update QR code');
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to update QR:', err);
      setError(err instanceof Error ? err.message : t('failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  const activeStaff = staff.filter((s) => s.status === 'ACTIVE');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editTeamQr')}</DialogTitle>
          <DialogDescription>
            {qrCode.label || 'QR'} - {t('editStaffList')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Staff Selection */}
          {isLoadingStaff ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('selectStaffMin2')}</div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
