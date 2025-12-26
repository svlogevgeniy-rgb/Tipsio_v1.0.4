'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Smartphone, Lock } from 'lucide-react';
import { useTranslations } from '@/i18n/client';
import { Card, CardContent } from '@/components/ui/card';
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-6">
              {t('problem.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{t('problem.desc1')}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">TIPSIO</span> {t('problem.desc2')}
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
                    <p className="text-sm text-muted-foreground">Cafe Organic</p>
                    <p className="font-semibold text-foreground">{t('problem.phoneSayThanks')}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4 w-full">
                    {['20k', '50k', '100k'].map((amount) => (
                      <button
                        key={amount}
                        className="py-3 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                    {t('problem.phoneCta')}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-4">{t('problem.phoneSecure')}</p>
                </div>
              </div>
            </div>
            <Card className="absolute -right-4 top-16 hidden sm:block animate-float shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('problem.badge1Label')}</p>
                    <p className="font-bold text-foreground">{t('problem.badge1Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -right-8 top-1/2 -translate-y-1/2 hidden sm:block animate-float-delayed shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('problem.badge2Label')}</p>
                    <p className="font-bold text-foreground">{t('problem.badge2Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -right-4 bottom-24 hidden sm:block animate-float shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('problem.badge3Label')}</p>
                    <p className="font-bold text-foreground">{t('problem.badge3Value')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -left-4 top-1/3 hidden lg:block animate-float-delayed shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lock size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('problem.badge4Label')}</p>
                    <p className="font-bold text-foreground">{t('problem.badge4Value')}</p>
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
