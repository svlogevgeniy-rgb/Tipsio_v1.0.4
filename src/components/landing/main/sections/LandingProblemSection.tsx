'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Shield, Smartphone, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/client';
import { fadeInUp } from './animation';

export function LandingProblemSection() {
  const t = useTranslations('landingV3');

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 mb-6">
              {t('problem.title')}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">{t('problem.desc1')}</p>
            <p className="text-lg text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">TIPSIO</span> {t('problem.desc2')}
            </p>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="relative mx-auto w-64 h-[500px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-900 rounded-full z-10" />
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                <div className="flex-1 p-6 flex flex-col items-center justify-center">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl">
                      👋
                    </div>
                    <p className="text-sm text-slate-600">Cafe Organic</p>
                    <p className="font-semibold text-slate-900">{t('problem.phoneSayThanks')}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4 w-full">
                    {['20k', '50k', '100k'].map((amount) => (
                      <button
                        key={amount}
                        className="py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <div className="w-full">
                    {/* Декоративная кнопка Google Pay (не кликабельная) */}
                    <div 
                      className="w-full h-12 rounded-[4px] bg-black flex items-center justify-center gap-2 cursor-default select-none"
                      style={{
                        boxShadow: '0 1px 1px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* Цветной логотип Google */}
                      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </g>
                      </svg>
                      <span className="text-white text-[15px] font-medium">Pay</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <p className="text-xs text-slate-600">secure payment via</p>
                    <Image
                      src="/images/midtrans-dark-3a5ac77cd3110b28b32cb590fc968f296d2123e686591d636bd51b276f6ed034.svg"
                      alt="Midtrans"
                      width={80}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Card className="absolute -right-4 top-16 hidden sm:block animate-float shadow-lg bg-white border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t('problem.badge1Label')}</p>
                    <p className="font-bold text-slate-900">{t('problem.badge1Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -right-8 top-1/2 -translate-y-1/2 hidden sm:block animate-float-delayed shadow-lg bg-white border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t('problem.badge2Label')}</p>
                    <p className="font-bold text-slate-900">{t('problem.badge2Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -right-4 bottom-24 hidden sm:block animate-float shadow-lg bg-white border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t('problem.badge3Label')}</p>
                    <p className="font-bold text-slate-900">{t('problem.badge3Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -left-4 top-1/3 hidden lg:block animate-float-delayed shadow-lg bg-white border-slate-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lock size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{t('problem.badge4Label')}</p>
                    <p className="font-bold text-slate-900">{t('problem.badge4Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
