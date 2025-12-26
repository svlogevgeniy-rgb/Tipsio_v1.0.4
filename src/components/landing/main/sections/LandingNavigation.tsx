'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useTranslations } from '@/i18n/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LandingNavigation() {
  const t = useTranslations('landingV3');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between md:grid md:grid-cols-3 md:items-center">
          {/* Left section - Login & Products dropdowns */}
          <div className="hidden md:flex items-center gap-2 justify-start">
            {/* Login Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="headerCta"
                  className="gap-1"
                >
                  Вход
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/venue/login" className="cursor-pointer">
                      Для заведений
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/staff/login" className="cursor-pointer">
                      Для персонала
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="cursor-pointer">
                      Для гостя
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="headerCta"
                  className="gap-1"
                >
                  Продукты
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="cursor-pointer">
                      Чаевые и отзывы
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="cursor-pointer">
                      Электронное меню
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="cursor-pointer">
                      Предзаказы
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {/* Login section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-2">
              Вход
            </p>
            <Link
              href="/venue/login"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Для заведений
            </Link>
            <Link
              href="/staff/login"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Для персонала
            </Link>
            <Link
              href="#"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Для гостя
            </Link>
          </div>

          {/* Products section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-2">
              Продукты
            </p>
            <Link
              href="#"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Чаевые и отзывы
            </Link>
            <Link
              href="#"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Электронное меню
            </Link>
            <Link
              href="#"
              className="block px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Предзаказы
            </Link>
          </div>

          {/* CTA button */}
          <div className="pt-2 border-t border-slate-100">
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
        </div>
      )}
    </header>
  );
}
