'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, X, Building2, CreditCard } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import {
  AccountDetailsForm,
  MidtransCredentialsForm,
} from '@/components/venue/register/forms';
import {
  step1Schema,
  step2Schema,
  type Step1Form,
  type Step2Form,
} from '@/components/venue/register/schemas';
import { usePersistedRegisterState } from '@/components/venue/register/use-persisted-register';
import { useTranslations } from '@/i18n/client';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('venue.register');
  const { setTheme } = useTheme();
  const {
    step,
    setStep,
    step1Data,
    setStep1Data,
    step2Data,
    setStep2Data,
    midtransValid,
    setMidtransValid,
    clearPersistedState,
  } = usePersistedRegisterState();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Force light theme for this page
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const form1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || undefined,
  });

  const form2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || undefined,
  });

  const handleStep1Submit = (data: Step1Form) => {
    setStep1Data(data);
    setStep(2);
    setError(null);
  };

  const testMidtransConnection = async () => {
    const data = form2.getValues();
    if (!data.clientKey || !data.serverKey || !data.merchantId) {
      setError('Please fill all Midtrans fields');
      return;
    }

    setIsTesting(true);
    setError(null);

    try {
      const response = await fetch('/api/venues/midtrans/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Invalid Midtrans credentials');
        setMidtransValid(false);
        return;
      }

      setMidtransValid(true);
      setStep2Data(data);
    } catch {
      setError('Failed to validate Midtrans credentials');
      setMidtransValid(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStep2Submit = async (data: Step2Form) => {
    if (!midtransValid) {
      setError('Please validate Midtrans credentials first');
      return;
    }
    if (!step1Data) return;

    setStep2Data(data);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step1Data.email,
          password: step1Data.password,
          venueName: step1Data.venueName,
          venueType: 'OTHER',
          midtrans: {
            clientKey: data.clientKey,
            serverKey: data.serverKey,
            merchantId: data.merchantId,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Registration failed');
        return;
      }

      clearPersistedState();

      const signInResult = await signIn('credentials', {
        email: step1Data.email,
        password: step1Data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/venue/login?registered=true');
      } else {
        router.push('/venue/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="fixed top-0 left-0 right-0 h-14 glass-heavy border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {t('step')} {step}/2
          </span>
        </div>
        <LanguageSwitcher />
      </div>

      <Card className="glass w-full max-w-md mt-14">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {step === 1 && <Building2 className="h-12 w-12 text-primary" />}
            {step === 2 && <CreditCard className="h-12 w-12 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-heading text-gradient">
            {step === 1 && t('step1Title')}
            {step === 2 && t('step2Title')}
          </CardTitle>
          <CardDescription>
            {step === 1 && t('step1Subtitle')}
            {step === 2 && t('step2Subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <AccountDetailsForm form={form1} onSubmit={handleStep1Submit} />
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('haveAccount')}{' '}
                <Link href="/venue/login" className="text-primary hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <MidtransCredentialsForm
              form={form2}
              onSubmit={handleStep2Submit}
              onTestConnection={testMidtransConnection}
              isTesting={isTesting}
              midtransValid={midtransValid}
              isSubmitting={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
