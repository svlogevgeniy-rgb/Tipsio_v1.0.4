# Документ проектирования

## Обзор

Данный проект направлен на улучшение пользовательского интерфейса системы управления заведениями через три основных направления: исправление текстов на странице регистрации заведений, обеспечение правильной настройки библиотеки компонентов shadcn/ui, и добавление функциональности управления профилем администратора.

Проект фокусируется на улучшении пользовательского опыта через более четкие тексты, согласованный дизайн компонентов и расширенные административные возможности.

## Архитектура

### Текущая архитектура
Система построена на Next.js 14 с использованием:
- **Frontend**: React с TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui библиотека компонентов
- **Интернационализация**: next-intl для поддержки русского и английского языков
- **Формы**: react-hook-form с zod валидацией
- **Стилизация**: Tailwind CSS с кастомными glass-эффектами

### Архитектурные принципы
- **Компонентный подход**: Использование переиспользуемых UI компонентов
- **Типобезопасность**: TypeScript для всех компонентов и API
- **Интернационализация**: Поддержка множественных языков через файлы переводов
- **Консистентность дизайна**: Единая система дизайна через shadcn/ui

## Компоненты и интерфейсы

### 1. Компонент регистрации заведения
**Расположение**: `src/app/venue/register/page.tsx`
**Ответственность**: Многошаговая форма регистрации заведения

**Интерфейсы**:
```typescript
interface Step3Form {
  distributionMode: "POOLED" | "PERSONAL"
}

interface TranslationKeys {
  step3Title: string
  step3Subtitle: string
  personalMode: string
  personalModeDesc: string
}
```

### 2. Система переводов
**Расположение**: `messages/ru.json`, `messages/en.json`
**Ответственность**: Хранение локализованных текстов

**Структура ключей**:
```json
{
  "venue.register": {
    "step3Title": "Модель распределения чаевых",
    "step3Subtitle": "Выберите, как распределяются чаевые",
    "personalMode": "Персональные чаевые"
  }
}
```

### 3. Конфигурация shadcn/ui
**Расположение**: `components.json`
**Ответственность**: Настройка путей и стилей для компонентов

**Интерфейс конфигурации**:
```typescript
interface ShadcnConfig {
  style: string
  rsc: boolean
  tsx: boolean
  tailwind: {
    config: string
    css: string
    baseColor: string
    cssVariables: boolean
  }
  aliases: Record<string, string>
}
```

### 4. Компонент админского профиля
**Расположение**: `src/app/admin/settings/page.tsx` (новый)
**Ответственность**: Управление профилем администратора

**Интерфейсы**:
```typescript
interface AdminProfile {
  companyName: string
  email: string
  password?: string
  confirmPassword?: string
}

interface AdminProfileFormProps {
  initialData: Partial<AdminProfile>
  onSubmit: (data: AdminProfile) => Promise<void>
  onError: (error: string) => void
}
```

## Модели данных

### Профиль администратора
```typescript
interface AdminProfile {
  id: string
  companyName: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}
```

### Форма обновления профиля
```typescript
interface AdminProfileUpdateRequest {
  companyName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface AdminProfileUpdateResponse {
  success: boolean
  message: string
  data?: Partial<AdminProfile>
  errors?: Record<string, string>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Radio button value preservation
*For any* form submission with distribution mode selection, changing the display labels should not affect the underlying radio button values
**Validates: Requirements 1.4**

### Property 2: Component import consistency  
*For any* shadcn/ui component usage, all imports should resolve from the configured src/components/ui directory path
**Validates: Requirements 2.2**

### Property 3: Profile form data loading
*For any* admin profile form initialization, existing company name and email data should be pre-populated from the backend response
**Validates: Requirements 3.3**

### Property 4: Profile update API calls
*For any* profile form submission with valid data, the system should make the correct API call with the submitted data
**Validates: Requirements 3.5**

### Property 5: Error message placement
*For any* profile update failure, error messages should be displayed adjacent to the relevant form fields that caused the validation failure
**Validates: Requirements 3.7**

### Property 6: Password confirmation validation
*For any* password change attempt, the system should validate that the password and confirmation password fields contain identical values
**Validates: Requirements 3.8**

## Обработка ошибок

### Стратегии обработки ошибок

1. **Валидация форм**
   - Клиентская валидация через zod схемы
   - Отображение ошибок рядом с соответствующими полями
   - Предотвращение отправки невалидных данных

2. **API ошибки**
   - Обработка сетевых ошибок с повторными попытками
   - Отображение понятных сообщений пользователю
   - Логирование ошибок для отладки

3. **Ошибки компонентов**
   - React Error Boundaries для критических ошибок
   - Fallback UI для поврежденных компонентов
   - Graceful degradation функциональности

### Коды ошибок

```typescript
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR', 
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface ErrorResponse {
  code: ErrorCodes
  message: string
  field?: string
  details?: Record<string, any>
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
- Конкретные примеры правильного отображения текстов
- Проверку наличия необходимых UI элементов
- Интеграционные точки между компонентами
- Специфические сценарии пользовательского взаимодействия

### Property-based тестирование

Для property-based тестирования будет использоваться библиотека **@fast-check/jest** для JavaScript/TypeScript.

Требования к property-based тестам:
- Каждый property-based тест должен выполнять минимум 100 итераций
- Каждый тест должен быть помечен комментарием, явно ссылающимся на свойство корректности из документа проектирования
- Формат тега: `**Feature: venue-ui-improvements, Property {number}: {property_text}**`
- Каждое свойство корректности должно быть реализовано ОДНИМ property-based тестом

### Тестовые фреймворки
- **Jest**: Основной тестовый фреймворк
- **React Testing Library**: Для тестирования React компонентов
- **@fast-check/jest**: Для property-based тестирования
- **MSW**: Для мокирования API вызовов