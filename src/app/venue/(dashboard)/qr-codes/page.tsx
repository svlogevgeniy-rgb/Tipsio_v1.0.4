"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, ExternalLink, Users, FileImage, FileText } from "lucide-react";
import { QR_MATERIALS, getBackgroundStyles, QrMaterial } from "@/lib/qr-materials";

type QrCode = {
  id: string;
  type: "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  shortCode: string;
  status: string;
  staff?: {
    id: string;
    displayName: string;
    status: string;
  } | null;
};

export default function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distributionMode, setDistributionMode] = useState<"POOLED" | "PERSONAL">("PERSONAL");
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [selectedQrForMaterials, setSelectedQrForMaterials] = useState<QrCode | null>(null);
  const [downloadingMaterial, setDownloadingMaterial] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const relevantQrs = distributionMode === "POOLED" 
    ? qrCodes.filter((qr) => qr.type === "VENUE" || qr.type === "TABLE")
    : qrCodes.filter((qr) => qr.type === "PERSONAL");

  useEffect(() => {
    async function fetchData() {
      try {
        const dashRes = await fetch("/api/venues/dashboard?period=week");
        if (!dashRes.ok) throw new Error("Failed to load venue");
        const dashData = await dashRes.json();

        if (dashData.venue?.id) {
          setDistributionMode(dashData.venue.distributionMode || "PERSONAL");
          setActiveStaffCount(dashData.metrics?.activeStaff || 0);

          const qrRes = await fetch(`/api/qr?venueId=${dashData.venue.id}`);
          if (qrRes.ok) {
            const qrData = await qrRes.json();
            const codes = qrData.qrCodes || [];
            setQrCodes(codes);
            
            if (codes.length > 0) {
              const relevantCodes = dashData.venue.distributionMode === "POOLED"
                ? codes.filter((qr: QrCode) => qr.type === "VENUE" || qr.type === "TABLE")
                : codes.filter((qr: QrCode) => qr.type === "PERSONAL");
              if (relevantCodes.length > 0) {
                setSelectedQrForMaterials(relevantCodes[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Не удалось загрузить QR-коды");
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownload = async (qrId: string, format: "png" | "svg", label: string) => {
    try {
      const response = await fetch(`/api/qr/${qrId}/download?format=${format}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${label.replace(/\s+/g, "-").toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Не удалось скачать QR-код");
    }
  };

  const handleDownloadMaterial = async (qrCode: QrCode, material: QrMaterial, format: "png" | "pdf") => {
    setDownloadingMaterial(`${material.id}-${format}`);
    try {
      const response = await fetch(`/api/qr/${qrCode.id}/material?materialId=${material.id}&format=${format}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${qrCode.shortCode}-${material.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download material failed:", err);
      setError("Не удалось скачать материал");
    } finally {
      setDownloadingMaterial(null);
    }
  };

  const MaterialPreview = ({ material, qrCode }: { material: QrMaterial; qrCode: QrCode }) => {
    const styles = getBackgroundStyles(material.backgroundColor);
    const isHorizontal = material.orientation === "horizontal";
    
    return (
      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
        <div 
          className="p-4 flex items-center justify-center"
          style={{ background: styles.background, minHeight: isHorizontal ? "120px" : "180px" }}
        >
          <div className={`flex ${isHorizontal ? "flex-row gap-4" : "flex-col gap-3"} items-center`}>
            <div 
              className="rounded-lg flex items-center justify-center"
              style={{ 
                width: isHorizontal ? "80px" : "100px",
                height: isHorizontal ? "80px" : "100px",
                backgroundColor: styles.qrColor === "#FFFFFF" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
              }}
            >
              <span className="text-xs" style={{ color: styles.qrColor === "#FFFFFF" ? "#000" : "#FFF" }}>QR</span>
            </div>
            <div className={`font-semibold ${isHorizontal ? "text-lg" : "text-base text-center"}`} style={{ color: styles.textColor }}>
              {material.ctaText}
            </div>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between bg-white/5">
          <span className="text-sm text-muted-foreground">{material.label}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownloadMaterial(qrCode, material, "png")} disabled={downloadingMaterial === `${material.id}-png`}>
              {downloadingMaterial === `${material.id}-png` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileImage className="h-3 w-3" />}
              <span className="ml-1">PNG</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownloadMaterial(qrCode, material, "pdf")} disabled={downloadingMaterial === `${material.id}-pdf`}>
              {downloadingMaterial === `${material.id}-pdf` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
              <span className="ml-1">PDF</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">QR-коды</h1>
        <p className="text-muted-foreground">
          {distributionMode === "POOLED" ? "QR-код заведения для приёма чаевых" : "QR-коды сотрудников для приёма чаевых"}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {distributionMode === "PERSONAL" && activeStaffCount === 0 && (
        <Card className="glass p-4 border-primary/30 bg-primary/10">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">Добавьте сотрудников</div>
              <div className="text-sm text-muted-foreground">Для генерации QR-кодов добавьте хотя бы одного сотрудника</div>
            </div>
            <Button size="sm" onClick={() => window.location.href = "/venue/staff"}>Добавить</Button>
          </div>
        </Card>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-heading">{distributionMode === "POOLED" ? "QR-код заведения" : "QR-коды сотрудников"}</CardTitle>
          <CardDescription>
            {distributionMode === "POOLED" ? "Автоматически сгенерированный QR-код для приёма чаевых" : "QR-коды создаются автоматически при добавлении сотрудников"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {relevantQrs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {distributionMode === "POOLED" ? "QR-код заведения будет создан автоматически" : "Нет QR-кодов. Добавьте сотрудников."}
              </p>
              {distributionMode === "PERSONAL" && (
                <Button variant="outline" onClick={() => (window.location.href = "/venue/staff")}>Добавить сотрудника</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {relevantQrs.map((qr) => (
                <div
                  key={qr.id}
                  className={`flex items-center justify-between p-4 rounded-xl border bg-white/5 cursor-pointer ${selectedQrForMaterials?.id === qr.id ? "border-primary/50" : "border-white/10"}`}
                  onClick={() => setSelectedQrForMaterials(qr)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{qr.staff?.displayName || qr.label || "QR заведения"}</div>
                    <div className="text-sm text-muted-foreground truncate">{baseUrl}/tip/{qr.shortCode}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.open(`${baseUrl}/tip/${qr.shortCode}`, "_blank"); }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(qr.id, "png", qr.staff?.displayName || qr.label || qr.shortCode); }}>
                      <Download className="h-4 w-4 mr-1" />PNG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQrForMaterials && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-heading">Материалы для печати</CardTitle>
            <CardDescription>Скачайте QR-код в разных дизайнах для размещения в заведении</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {relevantQrs.length > 1 && (
              <div className="space-y-2">
                <Label>Выберите QR-код</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {relevantQrs.map((qr) => (
                    <Button key={qr.id} variant={selectedQrForMaterials?.id === qr.id ? "default" : "outline"} className="justify-start text-sm" onClick={() => setSelectedQrForMaterials(qr)}>
                      {qr.staff?.displayName || qr.label || "QR заведения"}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Материалы для: <span className="text-foreground font-medium">{selectedQrForMaterials.staff?.displayName || selectedQrForMaterials.label || "QR заведения"}</span>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Горизонтальные</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QR_MATERIALS.filter(m => m.orientation === "horizontal").map((material) => (
                  <MaterialPreview key={material.id} material={material} qrCode={selectedQrForMaterials} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Вертикальные</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QR_MATERIALS.filter(m => m.orientation === "vertical").map((material) => (
                  <MaterialPreview key={material.id} material={material} qrCode={selectedQrForMaterials} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
