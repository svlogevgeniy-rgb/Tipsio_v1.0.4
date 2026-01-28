# Документ проектирования

## Обзор

Данный проект направлен на улучшение пользовательского интерфейса главной страницы платформы Tipsio через четыре основных направления: упрощение селектора языка, добавление логотипа и метки Beta, обновление отображения способов оплаты с использованием фирменных логотипов, и оптимизацию текста CTA-кнопки.

Проект фокусируется на улучшении визуальной идентичности бренда, упрощении интерфейса и повышении профессионального восприятия платформы.

## Архитектура

### Текущая архитектура
Система построена на Next.js 14 с использованием:
- **Frontend**: React с TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui библиотека компонентов
- **Интернационализация**: next-intl для поддержки русского и английского языков
- **Анимации**: Framer Motion для плавных переходов
- **Иконки**: Lucide React

### Архитектурные принципы
- **Компонентный подход**: Использование переиспользуемых UI компонентов
- **Типобезопасность**: TypeScript для всех компонентов
- **Интернационализация**: Поддержка множественных языков через файлы переводов
- **Консистентность дизайна**: Единая система дизайна

## Компоненты и интерфейсы

### 1. Компонент Navigation (Header)
**Расположение**: `src/app/page.tsx` (Navigation component)
**Ответственность**: Верхняя навигационная панель с логотипом, меню и переключателем языка

**Интерфейсы**:
```typescript
interface NavigationProps {
  // Компонент не принимает props, использует хуки
}

interface LogoProps {
  className?: string
}
```

### 2. Компонент Footer
**Расположение**: `src/app/page.tsx` (Footer component)
**Ответственность**: Нижняя часть страницы с брендингом и ссылками

**Интерфейсы**:
```typescript
interface FooterProps {
  // Компонент не принимает props, использует хуки
}
```

### 3. Компонент LanguageSwitcher
**Расположение**: `src/components/ui/language-switcher.tsx`
**Ответственность**: Переключение языка интерфейса

**Интерфейсы**:
```typescript
interface LanguageSwitcherProps {
  variant?: 'default' | 'minimal'
  showFlags?: boolean
}

interface LanguageOption {
  code: string
  label: string
  flag?: string
}
```

### 4. Компонент LogoBar (Payment Methods)
**Расположение**: `src/app/page.tsx` (LogoBar component)
**Ответственность**: Отображение доступных способов оплаты

**Интерфейсы**:
```typescript
interface PaymentMethod {
  name: string
  logo?: string
  type: 'image' | 'text'
}

interface LogoBarProps {
  methods: PaymentMethod[]
}
```

### 5. Компонент FinalCTASection
**Расположение**: `src/app/page.tsx` (FinalCTASection component)
**Ответственность**: Финальный призыв к действию

**Интерфейсы**:
```typescript
interface CTAButtonProps {
  text: string
  href: string
  className?: string
}
```

## Модели данных

### Конфигурация языков
```typescript
interface LanguageConfig {
  code: 'ru' | 'en'
  displayCode: string
  showFlag: boolean
}
```

### Конфигурация способов оплаты
```typescript
interface PaymentMethodConfig {
  id: string
  name: string
  logoPath: string
  altText: string
  enabled: boolean
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'visa', name: 'Visa', logoPath: '/images/payment/visa.svg', altText: 'Visa', enabled: true },
  { id: 'mastercard', name: 'Mastercard', logoPath: '/images/payment/mastercard.svg', altText: 'Mastercard', enabled: true },
  { id: 'googlepay', name: 'Google Pay', logoPath: '/images/payment/googlepay.svg', altText: 'Google Pay', enabled: true },
  { id: 'gopay', name: 'GoPay', logoPath: '/images/payment/gopay.svg', altText: 'GoPay', enabled: true },
  { id: 'ovo', name: 'OVO', logoPath: '/images/payment/ovo.svg', altText: 'OVO', enabled: true },
]
```

### Конфигурация брендинга
```typescript
interface BrandConfig {
  logoPath: string
  logoAlt: string
  brandName: string
  betaLabel: string
  betaStyles: {
    fontSize: string
    color: string
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Language switcher displays text codes only
*For any* rendered LanguageSwitcher component, the language options should display only text codes ("EN", "RU") without flag images
**Validates: Requirements 1.1**

### Property 2: Language dropdown text color
*For any* opened language dropdown, all option texts should be rendered in black color
**Validates: Requirements 1.2**

### Property 3: Language selection functionality
*For any* language selection action, the system should trigger the locale change function with the correct language code
**Validates: Requirements 1.3**

### Property 4: Interface update on language change
*For any* language change event, all translatable texts in the interface should update to reflect the selected locale
**Validates: Requirements 1.4**

### Property 5: Logo link navigation
*For any* logo element in header or footer, clicking should navigate to the home page ("/")
**Validates: Requirements 2.3**

### Property 6: Beta label styling
*For any* rendered beta label, the font size should be smaller than the brand name and the color should be gray
**Validates: Requirements 2.4**

### Property 7: Payment method logo display
*For any* payment method in the enabled list (Visa, Mastercard, Google Pay), the system should render an image element instead of text
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 8: Payment method logo size consistency
*For any* set of payment method logos, all logos should have the same height dimension
**Validates: Requirements 3.5**

### Property 9: CTA button link functionality
*For any* CTA button in the final section, the button should contain a link to the venue registration page
**Validates: Requirements 4.3**

### Property 10: CTA button text localization
*For any* locale setting, the CTA button text should be retrieved from the correct translation key
**Validates: Requirements 4.4**

## Обработка ошибок

### Стратегии обработки ошибок

1. **Отсутствующие ресурсы**
   - Fallback для отсутствующих логотипов
   - Отображение текстовых меток при ошибке загрузки изображений
   - Логирование ошибок загрузки ресурсов

2. **Ошибки локализации**
   - Fallback на английский язык при отсутствии перевода
   - Отображение ключа перевода в режиме разработки
   - Graceful degradation для отсутствующих переводов

3. **Ошибки навигации**
   - Обработка некорректных ссылок
   - Предотвращение навигации при ошибках
   - Логирование навигационных ошибок

### Коды ошибок

```typescript
enum UIErrorCodes {
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  TRANSLATION_MISSING = 'TRANSLATION_MISSING',
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',
  COMPONENT_RENDER_ERROR = 'COMPONENT_RENDER_ERROR'
}

interface UIError {
  code: UIErrorCodes
  message: string
  component?: string
  fallback?: React.ReactNode
}
```

## Стратегия тестирования

### Dual testing approach

Проект будет использовать комбинированный подход тестирования, включающий как unit тесты, так и property-based тесты:

- **Unit тесты** проверяют конкретные примеры, граничные случаи и условия ошибок
- **Property тесты** проверяют универсальные свойства, которые должны выполняться для всех входных данных
- Вместе они обеспечивают комплексное покрытие: unit тесты выявляют конкретные баги, property тесты проверяют общую корректность

### Unit тестирование

Unit тесты будут покрывать:
- Конкретные примеры отображения логотипа и метки Beta
- Проверку наличия/отсутствия конкретных элементов (QRIS)
- Проверку конкретного текста CTA-кнопки
- Специфические сценарии пользовательского взаимодействия

### Property-based тестирование

Для property-based тестирования будет использоваться библиотека **@fast-check/jest** для JavaScript/TypeScript.

Требования к property-based тестам:
- Каждый property-based тест должен выполнять минимум 100 итераций
- Каждый тест должен быть помечен комментарием, явно ссылающимся на свойство корректности из документа проектирования
- Формат тега: `**Feature: landing-page-improvements, Property {number}: {property_text}**`
- Каждое свойство корректности должно быть реализовано ОДНИМ property-based тестом

### Тестовые фреймворки
- **Jest**: Основной тестовый фреймворк
- **React Testing Library**: Для тестирования React компонентов
- **@fast-check/jest**: Для property-based тестирования
- **@testing-library/user-event**: Для симуляции пользовательских действий

### Визуальное тестирование
- Проверка отображения логотипов на разных разрешениях
- Проверка согласованности стилей между хедером и футером
- Проверка адаптивности на мобильных устройствах
