'use client';

import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/client';
import type { Step1Form, Step2Form } from './schemas';

interface AccountDetailsFormProps {
  form: UseFormReturn<Step1Form>;
  onSubmit: (data: Step1Form) => void;
}

export function AccountDetailsForm({ form, onSubmit }: AccountDetailsFormProps) {
  const t = useTranslations('venue.register');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="venueName">{t('venueName')}</Label>
        <Input
          id="venueName"
          placeholder={t('venueNamePlaceholder')}
          {...form.register('venueName')}
          className="h-12"
        />
        {form.formState.errors.venueName && (
          <p className="text-sm text-destructive">{form.formState.errors.venueName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...form.register('email')}
          className="h-12"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...form.register('password')}
          className="h-12"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...form.register('confirmPassword')}
          className="h-12"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-14 text-lg font-heading font-bold">
        {t('continue')}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}

interface MidtransCredentialsFormProps {
  form: UseFormReturn<Step2Form>;
  onSubmit: (data: Step2Form) => void;
  onTestConnection: () => void;
  isTesting: boolean;
  midtransValid: boolean;
  isSubmitting?: boolean;
}

export function MidtransCredentialsForm({
  form,
  onSubmit,
  onTestConnection,
  isTesting,
  midtransValid,
  isSubmitting = false,
}: MidtransCredentialsFormProps) {
  const t = useTranslations('venue.register');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="merchantId">{t('merchantId')}</Label>
        <Input
          id="merchantId"
          placeholder="G123456789"
          {...form.register('merchantId')}
          className="h-12"
        />
        {form.formState.errors.merchantId && (
          <p className="text-sm text-destructive">{form.formState.errors.merchantId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientKey">{t('clientKey')}</Label>
        <Input
          id="clientKey"
          type="password"
          placeholder="SB-Mid-client-..."
          {...form.register('clientKey')}
          className="h-12"
        />
        {form.formState.errors.clientKey && (
          <p className="text-sm text-destructive">{form.formState.errors.clientKey.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverKey">{t('serverKey')}</Label>
        <Input
          id="serverKey"
          type="password"
          placeholder="SB-Mid-server-..."
          {...form.register('serverKey')}
          className="h-12"
        />
        {form.formState.errors.serverKey && (
          <p className="text-sm text-destructive">{form.formState.errors.serverKey.message}</p>
        )}
      </div>

      <Button type="button" variant="outline" onClick={onTestConnection} disabled={isTesting} className="w-full h-12">
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('testing')}
          </>
        ) : midtransValid ? (
          <>
            <Check className="mr-2 h-4 w-4 text-success" />
            {t('connected')}
          </>
        ) : (
          t('testConnection')
        )}
      </Button>

      <Button type="submit" disabled={!midtransValid || isSubmitting} className="w-full h-14 text-lg font-heading font-bold">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('creating')}
          </>
        ) : (
          <>
            {t('createAccount')}
            <Check className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}

// Note: DistributionModeForm removed as part of QR code types refactoring
// Distribution mode is no longer selected during registration
