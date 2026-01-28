'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslations } from '@/i18n/client';

export function LandingNavigation() {
  const t = useTranslations('landingV3');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between md:grid md:grid-cols-3 md:items-center">
          {/* Left section - Login button */}
          <div className="hidden md:flex items-center gap-2 justify-start">
            <Link href="/venue/login">
              <Button variant="headerCta">{t('nav.login')}</Button>
            </Link>
          </div>

          {/* Center section - Logo */}
          <div className="flex items-center justify-start md:justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/Logo_1.svg"
                alt="TIPSIO Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="text-xl sm:text-2xl font-heading font-bold text-gradient">
                TIPSIO
              </span>
              <Badge variant="beta">BETA</Badge>
            </Link>
          </div>

          {/* Right section - Language & CTA */}
          <div className="hidden md:flex items-center gap-3 justify-end">
            <LanguageSwitcher />
            <Link href="/venue/register">
              <Button variant="headerCta">{t('nav.cta')}</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2 justify-end">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          {/* Login button */}
          <Link
            href="/venue/login"
            className="block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button variant="headerCta" className="w-full">
              {t('nav.login')}
            </Button>
          </Link>

          {/* CTA button */}
          <Link
            href="/venue/register"
            className="block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button variant="headerCta" className="w-full">
              {t('nav.cta')}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
