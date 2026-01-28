# Hero Image Assets

## Требования к изображению

- **Стиль**: Современный продуктовый UI-мок в эстетике shadcn/ui
- **Тема**: Светлый фон, card-based layout, мягкие тени, скруглённые углы
- **Контент**: Dashboard платформы гостевого опыта (чаевые, статистика, команда)
- **Без**: Реальных персональных данных, логотипов третьих сторон

## Размеры файлов

| Файл | Ширина | Формат | Макс. размер |
|------|--------|--------|--------------|
| hero-dashboard-desktop.webp | 1400-1800px | WebP | 400KB |
| hero-dashboard-mobile.webp | 800-1000px | WebP | 250KB |
| hero-dashboard-desktop.png | 1400-1800px | PNG | fallback |

## Промпт для генерации (AI Image Generation)

```
Minimal clean SaaS dashboard illustration in light theme, shadcn/ui style, 
card-based layout, rounded corners, subtle shadows, charts and metrics widgets, 
hospitality guest experience platform vibe, tipping statistics dashboard,
team members cards, QR code widget, transaction history,
no brand logos, no real text, generic UI labels, 
high resolution, modern product screenshot look, 
white background with soft gray cards, blue accent color
```

## Альтернативный промпт (более детальный)

```
Modern hospitality SaaS dashboard mockup, light theme UI design,
showing: tips statistics card with chart, team members avatars grid,
QR code generation widget, recent transactions list,
shadcn/ui design system aesthetic, Tailwind CSS styling,
rounded-xl corners, subtle drop shadows, slate-50 background,
blue-600 accent highlights, clean typography,
no real names or data, placeholder content only,
professional product screenshot style, 4K resolution
```

## Использование

После добавления изображений, они будут использоваться в `LandingHeroSection.tsx`:

```tsx
import Image from 'next/image';

<Image
  src="/images/hero/hero-dashboard-desktop.webp"
  alt="TIPSIO Dashboard"
  width={1600}
  height={900}
  priority
  className="rounded-2xl shadow-2xl"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```
