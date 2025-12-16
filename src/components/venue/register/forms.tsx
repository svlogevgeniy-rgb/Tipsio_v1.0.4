'use client';

import { type UseFormReturn } from 'react-hook-form';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/client';
import type { Step1Form, Step2Form, Step3Form } from './schemas';

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
}

export function MidtransCredentialsForm({
  form,
  onSubmit,
  onTestConnection,
  isTesting,
  midtransValid,
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

      <Button type="submit" disabled={!midtransValid} className="w-full h-14 text-lg font-heading font-bold">
        {t('continue')}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}

interface DistributionModeFormProps {
  form: UseFormReturn<Step3Form>;
  onSubmit: (data: Step3Form) => void;
  isSubmitting: boolean;
}

export function DistributionModeForm({ form, onSubmit, isSubmitting }: DistributionModeFormProps) {
  const t = useTranslations('venue.register');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        {[
          { value: 'POOLED', title: t('pooledMode'), desc: t('pooledModeDesc') },
          { value: 'PERSONAL', title: t('personalMode'), desc: t('personalModeDesc') },
        ].map((option) => (
          <label
            key={option.value}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              form.watch('distributionMode') === option.value ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input type="radio" value={option.value} {...form.register('distributionMode')} className="mt-1" />
            <div>
              <div className="font-semibold">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg font-heading font-bold">
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
