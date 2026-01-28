'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/i18n/client';

export function LandingHeroSection() {
  const t = useTranslations('landingV3');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffCode, setStaffCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Stub: здесь будет логика перехода на страницу чаевых по коду
    if (staffCode.trim()) {
      window.location.href = `/tip/${staffCode.trim()}`;
    }
  };

  return (
    <>
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 leading-tight mb-6">
            {t('hero.headlinePrefix')}{' '}
            <span className="italic">{t('hero.headlineItalic')}</span>{' '}
            {t('hero.headlineSuffix')}{' '}
            <span className="text-blue-600">{t('hero.headlineHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subheadline')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/venue/register">
              <Button
                variant="default"
                className="h-14 px-8 text-base rounded-[10px] shadow-lg bg-slate-900 hover:bg-blue-600 text-white min-w-[220px]"
              >
                {t('hero.ctaPrimary')}
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-14 px-8 text-base rounded-[10px] bg-white text-slate-900 border-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 min-w-[220px]"
              onClick={() => setIsDialogOpen(true)}
            >
              {t('hero.ctaSecondary')}
            </Button>
          </div>
        </div>
      </section>

      {/* Tip/Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[10px]">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-2xl sm:text-3xl font-heading font-bold">
              {t('hero.dialogTitle')}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {t('hero.dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="000 000"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              className="h-14 text-center text-lg rounded-[10px] bg-slate-100 border-0 placeholder:text-slate-400"
              maxLength={10}
            />
            <Button
              type="submit"
              className="w-full h-14 text-base rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!staffCode.trim()}
            >
              {t('hero.dialogSubmit')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
