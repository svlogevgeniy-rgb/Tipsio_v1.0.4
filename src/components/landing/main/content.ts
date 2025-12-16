import type { LucideIcon } from 'lucide-react';
import { Shield, QrCode, BarChart3, Building2, Users, Heart } from 'lucide-react';

export type StepIcon = LucideIcon;

export interface HowItWorksStep {
  icon: StepIcon;
  labelKey: string;
  titleKey: string;
  descKey: string;
  colorClass: string;
}

export interface BenefitCard {
  icon: StepIcon;
  titleKey: string;
  descKey: string;
  colorClass: string;
}

export interface FaqEntry {
  questionKey: string;
  answerKey: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Shield,
    labelKey: 'howItWorks.step1.label',
    titleKey: 'howItWorks.step1.title',
    descKey: 'howItWorks.step1.desc',
    colorClass: 'bg-green-100 text-green-600',
  },
  {
    icon: QrCode,
    labelKey: 'howItWorks.step2.label',
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.desc',
    colorClass: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart3,
    labelKey: 'howItWorks.step3.label',
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.desc',
    colorClass: 'bg-purple-100 text-purple-600',
  },
];

export const BENEFIT_CARDS: BenefitCard[] = [
  {
    icon: Building2,
    titleKey: 'benefits.business.title',
    descKey: 'benefits.business.desc',
    colorClass: 'bg-blue-600',
  },
  {
    icon: Users,
    titleKey: 'benefits.team.title',
    descKey: 'benefits.team.desc',
    colorClass: 'bg-purple-600',
  },
  {
    icon: Heart,
    titleKey: 'benefits.guests.title',
    descKey: 'benefits.guests.desc',
    colorClass: 'bg-pink-600',
  },
];

export const FAQ_ENTRIES: FaqEntry[] = [
  { questionKey: 'faq.q1.q', answerKey: 'faq.q1.a' },
  { questionKey: 'faq.q2.q', answerKey: 'faq.q2.a' },
  { questionKey: 'faq.q3.q', answerKey: 'faq.q3.a' },
  { questionKey: 'faq.q4.q', answerKey: 'faq.q4.a' },
  { questionKey: 'faq.q5.q', answerKey: 'faq.q5.a' },
];
