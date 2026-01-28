'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n/client';

export function LandingFooter() {
  const t = useTranslations('landingV3');

  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Logo_1.svg"
            alt="TIPSIO Logo"
            width={32}
            height={32}
            className="h-8 w-8 filter invert brightness-0"
          />
          <span className="text-xl font-heading font-bold text-white">TIPSIO</span>
          <Badge variant="beta">BETA</Badge>
        </Link>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
          <a href="https://wa.me/message" className="hover:text-white transition-colors flex items-center gap-2 min-h-[44px] py-2">
            <MessageCircle size={16} />
            {t('footer.whatsapp')}
          </a>
          <Link href="#" className="hover:text-white transition-colors min-h-[44px] py-2 flex items-center">
            {t('footer.terms')}
          </Link>
          <Link href="#" className="hover:text-white transition-colors min-h-[44px] py-2 flex items-center">
            {t('footer.privacy')}
          </Link>
        </div>
        <p className="text-sm text-center md:text-right">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
