'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from '@/i18n/client';
import { Card } from '@/components/ui/card';
import { FAQ_ENTRIES } from '../content';
import { fadeInUp } from './animation';

export function LandingFAQSection() {
  const t = useTranslations('landingV3');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
            {t('faq.title')}
          </h2>
        </motion.div>
        <div className="space-y-3 sm:space-y-4">
          {FAQ_ENTRIES.map((faq, idx) => (
            <motion.div
              key={faq.questionKey}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden border-border">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 min-h-[56px] text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <span className="font-semibold text-foreground pr-4">{t(faq.questionKey)}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === idx && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {t(faq.answerKey)}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
