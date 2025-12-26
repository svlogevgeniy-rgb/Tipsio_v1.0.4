'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from '@/i18n/client';
import { Card, CardContent } from '@/components/ui/card';
import { fadeInUp } from './animation';

export function LandingProductsSection() {
  const t = useTranslations('landingV3.products');

  const PRODUCTS = [
    {
      titleKey: 'items.tipsReviews.title',
      descKey: 'items.tipsReviews.desc',
      image: '/images/products/product_1.png',
    },
    {
      titleKey: 'items.digitalMenu.title',
      descKey: 'items.digitalMenu.desc',
      image: '/images/products/product_2.png',
    },
    {
      titleKey: 'items.preorders.title',
      descKey: 'items.preorders.desc',
      image: '/images/products/product_3.png',
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground">
            {t('sectionTitle')}
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.titleKey}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow border-border overflow-hidden">
                <div className="relative aspect-[4/3] bg-slate-100 border-b border-border">
                  <div className="absolute inset-0 p-6">
                    <Image
                      src={product.image}
                      alt={t(product.titleKey)}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{t(product.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(product.descKey)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
