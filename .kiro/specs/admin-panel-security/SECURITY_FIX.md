# Исправление безопасности: Venue Dashboard API

## Проблема

После завершения задачи TIPS-44 (защита админ-панели) была обнаружена критическая уязвимость в API endpoint venue dashboard.

### Обнаруженная уязвимость

**Маршрут:** `/api/venues/dashboard`  
**Проблема:** API endpoint возвращал mock данные для неавторизованных пользователей вместо ошибки 401

**Код с уязвимостью:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // For development, return mock data
    if (!session) {
      return successResponse(generateMockDashboard(period)); // ❌ УЯЗВИМОСТЬ
    }
    // ...
```

### Последствия

1. Неавторизованные пользователи могли открывать страницы venue dashboard (например, `/venue/qr-codes`)
2. Хотя данные были mock, это создавало ложное впечатление доступа к системе
3. Middleware защищал маршруты, но API endpoint обходил эту защиту
4. Layout venue dashboard вызывал `getVenueDashboard()`, который получал mock данные без авторизации

## Исправление

### Изменения в `/api/venues/dashboard/route.ts`

**До:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // For development, return mock data
    if (!session) {
      return successResponse(generateMockDashboard(period));
    }
```

**После:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Require MANAGER or ADMIN role
    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";
```

### Ключевые изменения

1. ✅ Добавлена проверка наличия сессии и user ID
2. ✅ Добавлена проверка роли (MANAGER или ADMIN)
3. ✅ Возвращается 401 для неавторизованных пользователей
4. ✅ Возвращается 403 для пользователей без нужной роли
5. ✅ Удалена логика возврата mock данных для неавторизованных пользователей
6. ✅ Используется `NextResponse.json()` для согласованности с другими endpoints

## Проверка исправления

### Тестовые сценарии

1. **Неавторизованный доступ:**
   - Открыть `http://localhost:3000/venue/qr-codes` без авторизации
   - Ожидаемый результат: Редирект на `/venue/login`

2. **API без авторизации:**
   - Запрос к `/api/venues/dashboard` без токена
   - Ожидаемый результат: 401 Unauthorized

3. **Неправильная роль:**
   - Авторизация как STAFF
   - Попытка доступа к `/venue/qr-codes`
   - Ожидаемый результат: 403 Forbidden или редирект на `/staff/dashboard`

4. **Правильная авторизация:**
   - Авторизация как MANAGER
   - Доступ к `/venue/qr-codes`
   - Ожидаемый результат: Успешная загрузка страницы с реальными данными

## Связанные файлы

- `src/app/api/venues/dashboard/route.ts` - Исправленный API endpoint
- `src/app/venue/(dashboard)/layout.tsx` - Layout, использующий API
- `src/features/venue-dashboard/api/getVenueDashboard.ts` - Функция для получения данных
- `src/middleware.ts` - Middleware для защиты маршрутов

## Рекомендации

### Для предотвращения подобных проблем в будущем:

1. **Никогда не возвращать данные (даже mock) для неавторизованных пользователей**
2. **Всегда проверять авторизацию в начале API handlers**
3. **Использовать согласованный подход к проверке авторизации:**
   ```typescript
   // Хороший паттерн
   const session = await auth();
   if (!session?.user?.id) {
     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
   }
   ```
4. **Проверять роли для защищенных endpoints:**
   ```typescript
   if (!['MANAGER', 'ADMIN'].includes(session.user.role)) {
     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
   }
   ```
5. **Использовать helper функции `requireAuth()` и `requireRole()` где возможно**

## Статус

- ✅ Уязвимость исправлена
- ✅ Код обновлен
- ⏳ Требуется тестирование в production
- ⏳ Требуется аудит других API endpoints на подобные проблемы

## Дата исправления

31 января 2026
