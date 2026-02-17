'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  purpose: z.enum(['CONNECTION', 'SUPPORT']),
  businessName: z.string().min(1, 'Required field').max(100),
  contactName: z.string().min(1, 'Required field').max(50),
  email: z.string().min(1, 'Required field').email('Invalid email format'),
  phone: z.string().min(1, 'Required field').max(20),
});

type FormData = z.infer<typeof formSchema>;

export function ConnectionFormDialog({ open, onOpenChange }: ConnectionFormDialogProps) {
  const t = useTranslations('landingV3.connectionForm');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: 'CONNECTION',
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/connection-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      // Success
      toast({
        title: t('successMessage'),
        variant: 'default',
      });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('errors.serverError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-heading font-bold tracking-tight text-[#1e5a4a]">
              TIPSIO
            </span>
            <span className="rounded-full bg-[#1e5a4a] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              BETA
            </span>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Purpose Select */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('purposeLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONNECTION">{t('purposeConnection')}</SelectItem>
                      <SelectItem value="SUPPORT">{t('purposeSupport')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Name Input */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('businessNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('businessNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Name Input */}
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('contactNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('contactNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Input */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('phoneLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? '...' : t('submitButton')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
