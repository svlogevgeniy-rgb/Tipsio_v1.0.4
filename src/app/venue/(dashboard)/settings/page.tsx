'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { IntegrationCard } from '@/components/venue/integrations/IntegrationCard';
import { MidtransSettings } from '@/components/venue/integrations/MidtransSettings';
import { useVenueDashboard } from '@/features/venue-dashboard/hooks/useVenueDashboard';
import { useTranslations } from '@/i18n/client';

type ViewMode = 'grid' | 'midtrans';

export default function VenueSettingsPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Midtrans state
  const [midtransConnected, setMidtransConnected] = useState(false);
  const [midtransMerchantId, setMidtransMerchantId] = useState('');

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('venue.settings');
  const tIntegrations = useTranslations('venue.settings.integrations');

  // Get venue data from shared context
  const { data: dashboardData } = useVenueDashboard();
  const venueId = dashboardData?.venue?.id;

  useEffect(() => {
    async function fetchSettings() {
      if (!venueId) {
        setIsPageLoading(false);
        return;
      }

      try {
        const settingsRes = await fetch(`/api/venues/${venueId}/settings`);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setMidtransConnected(settings.midtransConnected || false);
          if (settings.midtransMerchantId) {
            setMidtransMerchantId(settings.midtransMerchantId);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchSettings();
  }, [venueId]);

  const handleSaveSuccess = () => {
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 3000);
    setMidtransConnected(true);
    setViewMode('grid');
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {viewMode === 'grid' && (
        <>
          <div>
            <h1 className="text-2xl font-heading font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {saved && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('saved')}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <IntegrationCard
              name="Midtrans"
              logo="/images/midtrans-dark-3a5ac77cd3110b28b32cb590fc968f296d2123e686591d636bd51b276f6ed034.svg"
              isConnected={midtransConnected}
              onClick={() => setViewMode('midtrans')}
            />
            
            <IntegrationCard
              name="DOKU"
              logo="/images/doku-logo.png"
              isDisabled
              comingSoonText={tIntegrations('comingSoon')}
            />
            
            <IntegrationCard
              name="Xendit"
              logo="/images/xendit-logo.svg"
              isDisabled
              comingSoonText={tIntegrations('comingSoon')}
            />
          </div>
        </>
      )}

      {viewMode === 'midtrans' && venueId && (
        <MidtransSettings
          venueId={venueId}
          isConnected={midtransConnected}
          merchantId={midtransMerchantId}
          onBack={() => setViewMode('grid')}
          onSaveSuccess={handleSaveSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
