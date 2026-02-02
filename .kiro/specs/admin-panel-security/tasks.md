# План реализации: Безопасность админ-панели

## Обзор

Этот план фокусируется на валидации существующей защиты админ-панели, добавлении клиентского компонента AdminGuard для предотвращения мигания контента, и создании комплексных тестов для проверки всех аспектов безопасности. Большая часть защиты уже реализована в middleware и API middleware функциях.

## Задачи

- [x] 1. Создать компонент AdminGuard для клиентской защиты
  - Создать `src/components/admin/AdminGuard.tsx` с проверкой сессии
  - Реализовать логику редиректа на основе роли пользователя
  - Добавить loading state для предотвращения мигания контента
  - Обернуть admin layout в AdminGuard
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 1.1 Написать unit тесты для AdminGuard
  - Тест отображения loading state во время проверки сессии
  - Тест редиректа при отсутствии сессии
  - Тест редиректа для роли MANAGER на `/venue/dashboard`
  - Тест редиректа для роли STAFF на `/staff/dashboard`
  - Тест рендеринга контента для роли ADMIN
  - _Requirements: 4.2, 4.3_

- [x] 1.2 Написать property тест для AdminGuard
  - **Property 6: AdminGuard prevents content flash**
  - **Validates: Requirements 4.4**

- [ ] 2. Создать тесты для Next.js Middleware
  - [x] 2.1 Написать unit тесты для middleware
    - Тест пропуска статических файлов и Next.js internals
    - Тест пропуска публичных маршрутов
    - Тест редиректа MANAGER на `/venue/dashboard`
    - Тест редиректа STAFF на `/staff/dashboard`
    - Тест редиректа неизвестной роли на `/`
    - Тест извлечения JWT без запросов к БД
    - _Requirements: 2.3, 2.4, 2.5, 7.4_

  - [ ] 2.2 Написать property тест для unauthenticated UI redirect
    - **Property 1: Unauthenticated UI redirect with callback**
    - **Validates: Requirements 1.1, 5.3**

  - [ ] 2.3 Написать property тест для role-based UI access
    - **Property 3: Role-based UI access control**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [ ] 2.4 Написать property тест для middleware interception
    - **Property 5: Middleware intercepts before rendering**
    - **Validates: Requirements 4.1, 6.4**

  - [ ] 2.5 Написать property тест для admin route protection
    - **Property 8: All admin routes are protected**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 3. Checkpoint - Убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, спросить пользователя, если возникнут вопросы.

- [ ] 4. Создать тесты для API Middleware
  - [ ] 4.1 Написать unit тесты для requireAuth и requireRole
    - Тест `requireAuth()` с отсутствующей сессией → 401
    - Тест `requireAuth()` с валидной сессией → success
    - Тест `requireRole()` с правильной ролью → success
    - Тест `requireRole()` с неправильной ролью → 403
    - Тест, что авторизация выполняется до бизнес-логики
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ] 4.2 Написать property тест для unauthenticated API rejection
    - **Property 2: Unauthenticated API rejection**
    - **Validates: Requirements 1.2, 3.3, 5.1**

  - [ ] 4.3 Написать property тест для role-based API access
    - **Property 4: Role-based API access control**
    - **Validates: Requirements 3.2, 3.4, 5.2**

  - [ ] 4.4 Написать property тест для HTTP status codes
    - **Property 7: Consistent HTTP status codes**
    - **Validates: Requirements 5.4**

- [ ] 5. Создать тесты для JWT token validation
  - [ ] 5.1 Написать unit тесты для JWT validation
    - Тест валидации токена с правильной подписью
    - Тест отклонения токена с неправильной подписью
    - Тест отклонения истекшего токена
    - Тест, что NEXTAUTH_SECRET используется для подписи
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 5.2 Написать property тест для JWT token validation
    - **Property 9: JWT token validation**
    - **Validates: Requirements 7.2, 7.3**

- [ ] 6. Создать integration тесты
  - [ ] 6.1 Написать end-to-end тесты для admin access flows
    - Тест: неаутентифицированный пользователь → login → admin panel
    - Тест: MANAGER пытается получить доступ к админке → редирект на venue dashboard
    - Тест: ADMIN получает доступ ко всем страницам админки
    - Тест: истекшая сессия вызывает редирект при следующем действии
    - _Requirements: 1.1, 1.3, 2.1, 2.3_

- [ ] 7. Checkpoint - Финальная проверка
  - Убедиться, что все тесты проходят, спросить пользователя, если возникнут вопросы.

## Примечания

- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property тесты валидируют универсальные свойства корректности
- Unit тесты валидируют конкретные примеры и edge cases
- Большая часть защиты уже реализована, фокус на тестировании и клиентской защите
- Все тесты обязательны для комплексного покрытия безопасности
