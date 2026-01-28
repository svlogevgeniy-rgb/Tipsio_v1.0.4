import type { ReactNode } from 'react';
import { Shield, QrCode, BarChart3, Building2, Users, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

export interface LegacyStep {
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
  colorClass: string;
}

export interface LegacyBenefit {
  icon: LucideIcon;
  title: string;
  desc: string;
  colorClass: string;
}

export interface LegacyFaq {
  question: string;
  answer: ReactNode;
}

export const LEGACY_STEPS: LegacyStep[] = [
  {
    icon: Shield,
    label: 'Safe',
    title: 'Ваш Midtrans — Ваши правила',
    desc: 'Вы подключаете свой существующий аккаунт Midtrans. Мы не касаемся денег — транзакции идут напрямую от гостя к вам.',
    colorClass: 'bg-green-100 text-green-600',
  },
  {
    icon: QrCode,
    label: 'Fast',
    title: 'QR-коды везде',
    desc: 'Разместите QR на столах, в папках для счёта или на бейджах. Гость сканирует камерой → выбирает сумму → оплачивает.',
    colorClass: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart3,
    label: 'Fair',
    title: 'Умный баланс',
    desc: 'Система сама считает, сколько заработал каждый сотрудник (или общая «банка»). В конце смены вы видите точные суммы для выплаты.',
    colorClass: 'bg-purple-100 text-purple-600',
  },
];

export const LEGACY_BENEFITS: LegacyBenefit[] = [
  {
    icon: Building2,
    title: 'Бизнесу: Удержание команды',
    desc: 'Хорошие чаевые — лучшая мотивация. Снизьте текучку кадров, дав персоналу легальный способ зарабатывать больше с безналичных гостей.',
    colorClass: 'bg-blue-600',
  },
  {
    icon: Users,
    title: 'Команде: Честность',
    desc: 'Официанты видят свои накопления в реальном времени. Никаких споров о том, кто и сколько заработал за смену.',
    colorClass: 'bg-purple-600',
  },
  {
    icon: Heart,
    title: 'Гостям: Комфорт',
    desc: 'Никакого чувства вины из-за отсутствия кэша. Оплата в 2 клика, комиссию можно настроить так, чтобы её оплачивал гость.',
    colorClass: 'bg-pink-600',
  },
];

export const LEGACY_FAQS: LegacyFaq[] = [
  {
    question: 'Нужно ли мне открывать новый счёт?',
    answer: 'Нет, если у вас уже есть Midtrans, мы интегрируемся с ним. Если нет — поможем подключить.',
  },
  {
    question: 'Деньги проходят через счета TIPSIO?',
    answer:
      'Никогда. Технически деньги идут: Карта гостя → Ваш Midtrans → Ваш банковский счёт. Мы предоставляем только IT-инфраструктуру.',
  },
  {
    question: 'Сколько это стоит для заведения?',
    answer: (
      <>
        Сейчас сервис полностью бесплатен{' '}
        <Badge variant="beta" className="ml-2">
          BETA
        </Badge>
        . В будущем комиссия составит 5%, но вы сможете настроить её оплату за счёт гостя (сверх суммы чаевых).
      </>
    ),
  },
  {
    question: 'Как платить налоги?',
    answer:
      'Чаевые (Service Charge / Gratuity) имеют свои особенности в Индонезии. TIPSIO предоставляет детальные отчёты для вашей бухгалтерии, чтобы всё было «белым».',
  },
  {
    question: 'Нужен ли интернет персоналу?',
    answer: 'Только чтобы проверить баланс. Для приёма чаевых нужен только напечатанный QR-код.',
  },
];
