'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/client';
import { BENEFIT_CARDS } from '../content';
import { fadeInUp } from './animation';

export function LandingBenefitsSection() {
  const t = useTranslations('landingV3');

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-4">
            {t('benefits.title')}
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {BENEFIT_CARDS.map((benefit, idx) => (
            <motion.div
              key={benefit.titleKey}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-6 lg:p-8">
                  <div className={`w-12 h-12 rounded-xl ${benefit.colorClass} flex items-center justify-center mb-4 flex-shrink-0`}>
                    <benefit.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{t(benefit.titleKey)}</h3>
                  <p className="text-slate-300 leading-relaxed">{t(benefit.descKey)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
