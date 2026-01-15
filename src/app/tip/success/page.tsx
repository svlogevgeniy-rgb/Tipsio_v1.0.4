"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Heart, ArrowLeft } from "lucide-react";
import { StaffAvatar } from "@/components/tip/StaffAvatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import { formatCurrencyIDRIntl } from "@/lib/i18n/formatters";

interface TipDetails {
  amount: number;
  staffName: string | null;
  venueName: string;
  staffAvatarUrl?: string | null;
}

export default function TipSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const t = useTranslations("guest.success");

  const [loading, setLoading] = useState(true);
  const [tipDetails, setTipDetails] = useState<TipDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchTipDetails();
    } else {
      setError("Missing order information");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function fetchTipDetails() {
    try {
      const res = await fetch(`/api/tips/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setTipDetails(data);
      } else {
        setError("Could not load tip details");
      }
    } catch (err) {
      console.error("Failed to fetch tip details:", err);
      setError("Failed to load tip details");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-[759px] mx-auto flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full max-w-[759px] mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-green-700 font-semibold text-lg">tipsio</span>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Error Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Oops!</h1>
          <p className="text-gray-500 text-center mb-6 max-w-xs">{error}</p>
          <Button
            variant="outline"
            className="w-full max-w-xs border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-400">© 2026 TIPSIO.</p>
        </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-[759px] mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <span className="text-green-700 font-semibold text-lg">tipsio</span>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 text-center mb-6 max-w-xs">
          {t("subtitle")}
        </p>

        {/* Details Card */}
        {tipDetails && (
          <div className="w-full max-w-xs rounded-xl bg-white border border-gray-200 p-4 mb-6 shadow-sm">
            {/* Staff Avatar Section */}
            {(tipDetails.staffName || tipDetails.staffAvatarUrl) && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <StaffAvatar
                  src={tipDetails.staffAvatarUrl || null}
                  alt={tipDetails.staffName || "Staff"}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {tipDetails.staffName || t("theTeam")}
                  </p>
                  <p className="text-xs text-gray-500">{tipDetails.venueName}</p>
                </div>
              </div>
            )}
            
            {/* Amount */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 text-sm">{t("amount")}</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrencyIDRIntl(tipDetails.amount)}
              </span>
            </div>
            
            {/* Recipient (if no avatar section shown) */}
            {!tipDetails.staffName && !tipDetails.staffAvatarUrl && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-gray-500 text-sm">{t("to")}</span>
                <span className="font-medium text-gray-900">
                  {t("theTeam")}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-400 text-center max-w-xs mb-8">
          {t("message")}
        </p>

        {/* Close Button */}
        <Button
          className="w-full max-w-xs bg-green-700 hover:bg-green-800 text-white rounded-xl h-12"
          onClick={() => window.close()}
        >
          {t("close")}
        </Button>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 p-4 text-center">
        <p className="text-sm text-gray-400">© 2026 TIPSIO.</p>
      </footer>
      </div>
    </div>
  );
}
