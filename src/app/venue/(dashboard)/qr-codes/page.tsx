'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useMemo } from 'react';
import { Download, ExternalLink, QrCode, Plus, Users, User, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateQrDialog } from '@/components/venue/qr-codes/CreateQrDialog';
import { EditTeamQrDialog } from '@/components/venue/qr-codes/EditTeamQrDialog';
import { QrGenerator } from '@/components/venue/qr-codes/QrGenerator';
import { useVenueDashboard } from '@/features/venue-dashboard/hooks/useVenueDashboard';
import { useTranslations } from '@/i18n/client';

type QrFilter = 'all' | 'team' | 'individual';

type StaffMember = {
  id: string;
  displayName: string;
  status: string;
  avatarUrl: string | null;
  role: string;
};

type QrCodeType = {
  id: string;
  type: 'INDIVIDUAL' | 'TEAM' | 'PERSONAL' | 'TABLE' | 'VENUE';
  label: string | null;
  shortCode: string;
  status: string;
  staff?: StaffMember | null;
  recipients?: StaffMember[];
};

export default function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [activeFilter, setActiveFilter] = useState<QrFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQr, setEditingQr] = useState<QrCodeType | null>(null);
  const t = useTranslations('venue.qr');

  // Get venue data from shared context
  const { data: dashboardData } = useVenueDashboard();
  const venueId = dashboardData?.venue?.id;
  const venueName = dashboardData?.venue?.name || '';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Filtered QR codes based on active filter
  const filteredQrCodes = useMemo(() => {
    if (activeFilter === 'all') {
      return qrCodes;
    }
    
    if (activeFilter === 'team') {
      return qrCodes.filter(qr => 
        qr.type === 'TEAM' || qr.type === 'TABLE' || qr.type === 'VENUE'
      );
    }
    
    if (activeFilter === 'individual') {
      return qrCodes.filter(qr => 
        qr.type === 'INDIVIDUAL' || qr.type === 'PERSONAL'
      );
    }
    
    return qrCodes;
  }, [qrCodes, activeFilter]);

  const fetchQrCodes = async () => {
    if (!venueId) {
      return;
    }

    try {
      const qrRes = await fetch(`/api/qr?venueId=${venueId}`);
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setQrCodes(qrData.qrCodes || []);
      }
    } catch (err) {
      console.error('Failed to load QR codes:', err);
      setError(t('failedToLoad'));
    }
  };

  useEffect(() => {
    fetchQrCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, t]);

  const handleDownload = async (qrId: string, format: 'png' | 'svg') => {
    try {
      const response = await fetch(`/api/qr/${qrId}/download?format=${format}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${venueName.replace(/\s+/g, '-').toLowerCase() || 'venue'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      setError(t('failedToDownload'));
    }
  };

  const handleQrCreated = () => {
    setShowCreateDialog(false);
    fetchQrCodes();
  };

  const handleQrUpdated = () => {
    setEditingQr(null);
    fetchQrCodes();
  };

  const isTeamQr = (type: string) => {
    return type === 'TEAM' || type === 'TABLE' || type === 'VENUE';
  };

  const getQrTypeLabel = (type: string) => {
    if (type === 'INDIVIDUAL' || type === 'PERSONAL') return 'Individual';
    if (type === 'TEAM' || type === 'TABLE' || type === 'VENUE') return 'Team';
    return type;
  };

  const getQrTypeIcon = (type: string) => {
    if (type === 'INDIVIDUAL' || type === 'PERSONAL') return <User className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const getEmptyStateMessage = (filter: QrFilter) => {
    switch (filter) {
      case 'all':
        return 'У вас пока нет QR-кодов';
      case 'team':
        return 'У вас пока нет командных QR-кодов';
      case 'individual':
        return 'У вас пока нет индивидуальных QR-кодов';
      default:
        return 'У вас пока нет QR-кодов';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Создать QR
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      {qrCodes.length > 0 && (
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as QrFilter)}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="team">Командный QR</TabsTrigger>
            <TabsTrigger value="individual">Индивидуальный QR</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* QR Codes List */}
      {filteredQrCodes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredQrCodes.map((qr) => (
            <Card key={qr.id} className="glass">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {getQrTypeIcon(qr.type)}
                        {getQrTypeLabel(qr.type)}
                      </div>
                    </div>
                    <CardTitle className="font-heading text-lg">{qr.label || venueName}</CardTitle>
                    {qr.type === 'INDIVIDUAL' || qr.type === 'PERSONAL' ? (
                      qr.staff && (
                        <CardDescription className="text-sm">
                          {qr.staff.displayName}
                        </CardDescription>
                      )
                    ) : (
                      <CardDescription className="text-sm">
                        {qr.recipients?.length || 0} сотрудников
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* QR Preview */}
                  <div className="w-24 h-24 bg-white rounded-lg p-2 shadow-sm flex-shrink-0">
                    <img
                      src={`/api/qr/${qr.id}/download?format=svg`}
                      alt="QR Code"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Info & Actions */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      {baseUrl}/tip/{qr.shortCode}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {isTeamQr(qr.type) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQr(qr)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Редактировать
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`${baseUrl}/tip/${qr.shortCode}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Открыть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(qr.id, "png")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(qr.id, "svg")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        SVG
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">{getEmptyStateMessage(activeFilter)}</p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Создать QR
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Materials Constructor - show for first QR */}
      {qrCodes.length > 0 && qrCodes[0] && (
        <Card className="glass">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading">{t("printMaterials")}</CardTitle>
            <CardDescription>{t("printMaterialsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <QrGenerator shortCode={qrCodes[0].shortCode} venueName={venueName} />
          </CardContent>
        </Card>
      )}

      {/* Create QR Dialog */}
      <CreateQrDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        venueId={venueId || ''}
        onSuccess={handleQrCreated}
      />

      {/* Edit Team QR Dialog */}
      {editingQr && (
        <EditTeamQrDialog
          open={!!editingQr}
          onOpenChange={(open) => !open && setEditingQr(null)}
          qrCode={editingQr}
          venueId={venueId || ''}
          onSuccess={handleQrUpdated}
        />
      )}
    </div>
  );
}
