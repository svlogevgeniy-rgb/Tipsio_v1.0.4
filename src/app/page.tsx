'use client';

import {
  LandingNavigation,
  LandingHeroSection,
  LandingLogoBar,
  LandingProblemSection,
  LandingProductsSection,
  LandingProductDemoSection,
  LandingBenefitsSection,
  LandingFAQSection,
  LandingFinalCTASection,
  LandingFooter,
} from '@/components/landing/main/sections';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <LandingNavigation />
      <LandingHeroSection />
      <LandingLogoBar />
      <LandingProblemSection />
      <LandingProductsSection />
      <LandingProductDemoSection />
      <LandingBenefitsSection />
      <LandingFAQSection />
      <LandingFinalCTASection />
      <LandingFooter />
    </main>
  );
}
