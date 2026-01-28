import { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/client';
import { ConfirmationDialog } from './ConfirmationDialog';

interface MidtransSettingsProps {
  venueId: string;
  isConnected: boolean;
  merchantId: string;
  onBack: () => void;
  onSaveSuccess: () => void;
  onError: (message: string) => void;
}

export function MidtransSettings({
  venueId,
  isConnected,
  merchantId,
  onBack,
  onSaveSuccess,
  onError,
}: MidtransSettingsProps) {
  const t = useTranslations('venue.settings.midtrans');
  const tCommon = useTranslations('venue.settings');
  
  const [serverKey, setServerKey] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [newMerchantId, setNewMerchantId] = useState(merchantId);
  const [showServerKey, setShowServerKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasChanges = serverKey || clientKey || newMerchantId !== merchantId;

  const handleSaveClick = () => {
    if (!serverKey || !clientKey) {
      onError(t('fillAllFields'));
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    onError('');

    try {
      const response = await fetch(`/api/venues/${venueId}/midtrans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverKey,
          clientKey,
          merchantId: newMerchantId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setServerKey('');
        setClientKey('');
        onSaveSuccess();
      } else {
        onError(result.message || t('saveFailed'));
      }
    } catch {
      onError(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-heading">{t('setupTitle')}</CardTitle>
            <CardDescription>
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">
                  ✓ {t('isConnected')}
                  {merchantId && ` (Merchant ID: ${merchantId})`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('canUpdate')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchantId">
                  {t('merchantId')}
                  <span className="text-muted-foreground ml-1">({t('optional')})</span>
                </Label>
                <Input
                  id="merchantId"
                  placeholder="G123456789"
                  value={newMerchantId}
                  onChange={(e) => setNewMerchantId(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverKey">
                  {t('serverKey')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="serverKey"
                    type={showServerKey ? 'text' : 'password'}
                    placeholder={isConnected ? '••••••••••••' : 'SB-Mid-server-...'}
                    value={serverKey}
                    onChange={(e) => setServerKey(e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowServerKey(!showServerKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showServerKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientKey">
                  {t('clientKey')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="clientKey"
                    type={showClientKey ? 'text' : 'password'}
                    placeholder={isConnected ? '••••••••••••' : 'SB-Mid-client-...'}
                    value={clientKey}
                    onChange={(e) => setClientKey(e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientKey(!showClientKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showClientKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-4">
                  {t('getKeysFrom')}{' '}
                  <a
                    href="https://dashboard.midtrans.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Midtrans Dashboard
                  </a>
                </p>

                <Button
                  onClick={handleSaveClick}
                  disabled={isSaving || !hasChanges}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {tCommon('saving')}
                    </>
                  ) : (
                    tCommon('saveSettings')
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
