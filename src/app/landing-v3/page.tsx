'use client';

import {
  LegacyNavigation,
  LegacyHeroSection,
  LegacyProblemSection,
  LegacyHowItWorksSection,
  LegacyProductDemoSection,
  LegacyBenefitsSection,
  LegacyFAQSection,
  LegacyFinalCTASection,
  LegacyFooter,
} from '@/components/landing/legacy/sections';

export default function LegacyLandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <LegacyNavigation />
      <LegacyHeroSection />
      <LegacyProblemSection />
      <LegacyHowItWorksSection />
      <LegacyProductDemoSection />
      <LegacyBenefitsSection />
      <LegacyFAQSection />
      <LegacyFinalCTASection />
      <LegacyFooter />
    </main>
  );
}
