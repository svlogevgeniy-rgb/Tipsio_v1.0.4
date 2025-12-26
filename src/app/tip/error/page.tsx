"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function TipErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const t = useTranslations("guest.error");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex justify-end">
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Error Icon */}
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center ring-4 ring-red-500/20">
          <XCircle className="w-14 h-14 text-red-400" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold mb-2 text-center">{t("title")}</h1>
        <p className="text-slate-400 text-center mb-8 max-w-xs">{t("message")}</p>

        {/* Actions */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            className="w-full h-12 font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl"
            onClick={() => router.back()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("tryAgain")}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-slate-400 hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToAmount")}
          </Button>
        </div>

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
