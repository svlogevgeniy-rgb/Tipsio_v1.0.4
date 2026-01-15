'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/client';
import { fadeInUp } from './animation';

export function LandingFinalCTASection() {
  const t = useTranslations('landingV3');

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold mb-6"
        >
          {t('finalCta.titlePrefix')}{' '}
          <span className="italic">{t('finalCta.titleItalic')}</span>{' '}
          {t('finalCta.titleSuffix')}
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t('finalCta.subtitle')}
        </motion.p>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/venue/register">
            <Button variant="landing" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-blue-900/30">
              {t('finalCta.cta')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
