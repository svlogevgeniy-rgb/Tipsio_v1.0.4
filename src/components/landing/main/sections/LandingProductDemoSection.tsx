'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/client';
import { fadeInUp } from './animation';

export function LandingProductDemoSection() {
  const t = useTranslations('landingV3');

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 mb-6">
              {t('productDemo.title')}
            </h2>
            <ul className="space-y-4">
              {[t('productDemo.point1'), t('productDemo.point2'), t('productDemo.point3')].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <span className="text-slate-600">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-slate-500">dashboard.tipsio.io</span>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">{t('dashboard.today')}</p>
                      <p className="text-white text-2xl font-bold flex items-center gap-1">
                        IDR{' '}
                        <CountingNumber
                          number={2450000}
                          fromNumber={0}
                          transition={{ stiffness: 50, damping: 30 }}
                          inView
                          inViewOnce
                        />
                      </p>
                    </div>
                    <div className="text-green-400 text-sm font-medium">+18%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: t('productDemo.statsTransactions'), value: '47' },
                      { label: t('productDemo.statsAvgTip'), value: '52k' },
                      { label: t('productDemo.statsActiveQr'), value: '12' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs">{stat.label}</p>
                        <p className="text-white font-semibold">{stat.value}</p>
                      </div>
                    ))}
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
