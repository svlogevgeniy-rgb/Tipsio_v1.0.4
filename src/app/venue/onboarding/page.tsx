"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/i18n/client";

const midtransSchema = z.object({
  merchantId: z.string().min(1, "Merchant ID is required"),
  serverKey: z.string().min(1, "Server Key is required"),
  clientKey: z.string().min(1, "Client Key is required"),
});

type MidtransForm = z.infer<typeof midtransSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations('venue.onboarding');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Removed distribution step - now only 3 steps: profile, payments, done
  const steps = [t('profile'), t('payments'), t('done')];

  const midtransForm = useForm<MidtransForm>({
    resolver: zodResolver(midtransSchema),
  });

  const handleMidtransSubmit = async (data: MidtransForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Get venue ID from session
      const response = await fetch("/api/venues/current/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, environment: "sandbox" }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to connect Midtrans");
        return;
      }

      // Skip to done step (was step 3, now step 2)
      setCurrentStep(2);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('profileCreated')}
            </p>
            <Button
              onClick={() => setCurrentStep(1)}
              className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {t('continueToPayments')}
            </Button>
          </div>
        );

      case 1:
        return (
          <form onSubmit={midtransForm.handleSubmit(handleMidtransSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('midtransInfo')}
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="merchantId">{t('merchantId')}</Label>
              <Input
                id="merchantId"
                placeholder="G123456789"
                {...midtransForm.register("merchantId")}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientKey">{t('clientKey')}</Label>
              <Input
                id="clientKey"
                placeholder="SB-Mid-client-..."
                {...midtransForm.register("clientKey")}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverKey">{t('serverKey')}</Label>
              <Input
                id="serverKey"
                type="password"
                placeholder="SB-Mid-server-..."
                {...midtransForm.register("serverKey")}
                className="h-12"
              />
            </div>

            <a
              href="https://dashboard.midtrans.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline block"
            >
              {t('findKeys')}
            </a>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {isLoading ? t('testingConnection') : t('testConnection')}
            </Button>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4 text-center">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-heading font-bold">{t('readyTitle')}</h3>
            <p className="text-muted-foreground">
              {t('readyMessage')}
            </p>
            <Button
              onClick={() => router.push("/venue/dashboard")}
              className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {t('goToDashboard')}
            </Button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <Card className="glass w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-heading text-gradient">
            {steps[currentStep]}
          </CardTitle>
          <CardDescription>
            {t('step')} {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </main>
  );
}
