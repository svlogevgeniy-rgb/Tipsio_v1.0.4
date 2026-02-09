'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  businessName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(50),
  phone: z.string().regex(/^\+(?:62|7)\d{10,11}$/, {
    message: 'Phone must be in +62 or +7 format',
  }),
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
      <DialogContent className="sm:max-w-md rounded-[10px]">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl sm:text-3xl font-heading font-bold">
            {t('dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {/* Purpose Select */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('purposeLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-[10px]">
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
                  <FormLabel>{t('businessNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('businessNamePlaceholder')}
                      className="h-12 rounded-[10px]"
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
                  <FormLabel>{t('contactNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('contactNamePlaceholder')}
                      className="h-12 rounded-[10px]"
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
                  <FormLabel>{t('phoneLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      className="h-12 rounded-[10px]"
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
              className="w-full h-14 text-base rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white"
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
