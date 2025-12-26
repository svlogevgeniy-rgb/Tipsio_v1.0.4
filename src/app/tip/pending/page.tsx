"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import { Loader2, Clock } from "lucide-react";

const POLL_INTERVAL = 3000;
const MAX_POLLS = 60;

export default function TipPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const t = useTranslations("guest.pending");

  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/tips/${orderId}`);
      if (!res.ok) {
        throw new Error("Failed to check status");
      }

      const data = await res.json();

      if (data.status === "success" || data.status === "PAID") {
        router.replace(`/tip/success?order_id=${orderId}`);
        return;
      }

      if (
        data.status === "failed" ||
        data.status === "FAILED" ||
        data.status === "CANCELED" ||
        data.status === "EXPIRED"
      ) {
        router.replace(`/tip/error?order_id=${orderId}`);
        return;
      }

      setPollCount((prev) => prev + 1);
    } catch (err) {
      console.error("Status check error:", err);
      setError("Unable to check payment status");
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!orderId) {
      setError("No order reference found");
      return;
    }

    checkStatus();

    const interval = setInterval(() => {
      if (pollCount >= MAX_POLLS) {
        clearInterval(interval);
        setError("Payment verification timed out. Please check your payment app.");
        return;
      }
      checkStatus();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [orderId, pollCount, checkStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex justify-end">
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {error ? (
          <>
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center ring-4 ring-yellow-500/20">
              <Clock className="w-14 h-14 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-center">{t("pendingTitle")}</h1>
            <p className="text-slate-400 text-center mb-4 max-w-xs">{error}</p>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              {t("completedNote")}
            </p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center ring-4 ring-cyan-500/20">
              <Loader2 className="w-14 h-14 text-cyan-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-center">{t("title")}</h1>
            <p className="text-slate-400 text-center mb-6 max-w-xs">
              {t("subtitle")}
            </p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </>
        )}

        {orderId && (
          <p className="text-xs text-slate-600 mt-8">{t("reference")}: {orderId}</p>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-[10px] text-slate-600 text-gradient">{t("poweredBy")}</p>
      </footer>
    </div>
  );
}
