'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from '@/i18n/client';

export function LandingLogoBar() {
  const t = useTranslations('landingV3');
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Image
              src="/images/midtrans-dark-3a5ac77cd3110b28b32cb590fc968f296d2123e686591d636bd51b276f6ed034.svg"
              alt="Midtrans"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
            <span>{t('logoBar.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('logoBar.description')}</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8">
          <Image src="/images/payment/visa-color.svg" alt="Visa" width={60} height={24} className="h-6 w-auto" />
          <Image src="/images/payment/mastercard-color.svg" alt="Mastercard" width={60} height={40} className="h-6 w-auto" />
          <Image src="/images/payment/google-pay-color.svg" alt="Google Pay" width={60} height={24} className="h-6 w-auto" />
          <Image src="/images/payment/gopay-color.svg" alt="GoPay" width={60} height={24} className="h-6 w-auto" />
          <Image src="/images/payment/ovo-color.svg" alt="OVO" width={60} height={24} className="h-6 w-auto" />
        </div>
      </div>
    </section>
  );
}
