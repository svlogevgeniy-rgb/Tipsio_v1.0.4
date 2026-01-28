'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/i18n/client';
import type { StaffForm } from './schema';
import type { UseFormReturn } from 'react-hook-form';

interface StaffDialogProps {
  form: UseFormReturn<StaffForm>;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit: (data: StaffForm) => Promise<void>;
  triggerLabel: string;
  error?: string | null;
  isLoading: boolean;
  isUploading: boolean;
  avatarPreview: string | null;
  onFileSelect: (file?: File) => string | null;
  onClearAvatar: () => void;
}

export function StaffDialog({
  form,
  open,
  onOpenChange,
  onSubmit,
  triggerLabel,
  error,
  isLoading,
  isUploading,
  avatarPreview,
  onFileSelect,
  onClearAvatar,
}: StaffDialogProps) {
  const t = useTranslations('venue.staff');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (data: StaffForm) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="glass-heavy">
        <DialogHeader>
          <DialogTitle className="font-heading">{t('addStaffMember')}</DialogTitle>
          <DialogDescription>{t('addStaffDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">{t('displayName')} *</Label>
            <Input
              id="displayName"
              placeholder={t('displayNamePlaceholder')}
              {...form.register('displayName')}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">{t('fullName')}</Label>
            <Input
              id="fullName"
              placeholder={t('fullNamePlaceholder')}
              {...form.register('fullName')}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('role')} *</Label>
            <Select
              onValueChange={(value) => form.setValue('role', value as StaffForm['role'])}
              defaultValue={form.watch('role')}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAITER">{t('roles.waiter')}</SelectItem>
                <SelectItem value="BARISTA">{t('roles.barista')}</SelectItem>
                <SelectItem value="BARTENDER">{t('roles.bartender')}</SelectItem>
                <SelectItem value="HOSTESS">{t('roles.hostess')}</SelectItem>
                <SelectItem value="CHEF">{t('roles.chef')}</SelectItem>
                <SelectItem value="ADMINISTRATOR">{t('roles.administrator')}</SelectItem>
                <SelectItem value="OTHER">{t('roles.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('photo')}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              id="avatar-upload"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                const message = onFileSelect(selectedFile);
                if (message) {
                  form.setError('avatarUrl', { message });
                } else {
                  form.clearErrors('avatarUrl');
                }
              }}
            />

            {avatarPreview ? (
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    onClearAvatar();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="avatar-upload"
                className="flex flex-col items-center justify-center w-24 h-24 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">{t('addPhoto')}</span>
              </label>
            )}
            <p className="text-xs text-muted-foreground text-center">{t('photoHint')}</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {isUploading ? t('uploading') : isLoading ? t('adding') : t('addStaffButton')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
