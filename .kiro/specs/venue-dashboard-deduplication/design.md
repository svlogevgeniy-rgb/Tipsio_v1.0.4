# Design Document

## Overview

Устранение дублирующихся запросов к `/api/venues/dashboard` через создание единого источника данных на базе React Context. Архитектура использует server-side fetch в layout с передачей initialData в client-side Provider.

## Architecture

### Current Architecture (Проблема)

```
┌─────────────────────────────────────────┐
│  /venue/(dashboard) - Layout (client)   │
│  └─ useEffect → fetch /api/venues/...   │ ← Запрос 1
└─────────────────────────────────────────┘
           │
           ├─ Dashboard Page
           │  └─ useDashboardData
           │     └─ useEffect → fetch /api/venues/... ← Запрос 2
           │
           ├─ QR Codes Page
           │  └─ useEffect → fetch /api/venues/...    ← Запрос 3
           │
           ├─ Settings Page
           │  └─ useEffect → fetch /api/venues/...    ← Запрос 4
           │
           └─ Staff Page
              └─ useStaffManagement
                 └─ useEffect → fetch /api/venues/... ← Запрос 5
```

**Проблемы:**
- 5+ параллельных запросов к одному эндпоинту
- Race conditions при одновременной загрузке
- Медленная загрузка из-за waterfall эффекта
- Нет shared state между компонентами

### Target Architecture (Решение)

```
┌──────────────────────────────────────────────┐
│  /venue/(dashboard) - Layout (server)        │
│  └─ await fetch /api/venues/dashboard       │ ← Единственный запрос
│     └─ VenueDashboardProvider (client)       │
│        └─ initialData from server            │
└──────────────────────────────────────────────┘
           │
           │  [Shared Context State]
           │
           ├─ Dashboard Page
           │  └─ useVenueDashboard() → context
           │
           ├─ QR Codes Page
           │  └─ useVenueDashboard() → context
           │
           ├─ Settings Page
           │  └─ useVenueDashboard() → context
           │
           └─ Staff Page
              └─ useVenueDashboard() → context
```

**Преимущества:**
- Один запрос на сервере (быстрее)
- Shared state через Context
- Нет race conditions
- Простая синхронизация данных

## Components and Interfaces

### 1. Constants

```typescript
// src/features/venue-dashboard/constants.ts
export const DEFAULT_DASHBOARD_PERIOD = 'week' as const;
export const DASHBOARD_PERIODS = ['today', 'week', 'month'] as const;
export type DashboardPeriod = typeof DASHBOARD_PERIODS[number];
```

### 2. API Fetcher

```typescript
// src/features/venue-dashboard/api/getVenueDashboard.ts
export interface VenueDashboardData {
  venue: {
    id: string;
    name: string;
    distributionMode: 'PERSONAL' | 'POOLED';
  };
  metrics: {
    totalTips: number;
    transactionCount: number;
    averageTip: number;
    activeStaff: number;
  };
  topStaff: Array<{
    id: string;
    displayName: string;
    totalTips: number;
    tipsCount: number;
  }>;
  hasPendingPayouts: boolean;
}

export async function getVenueDashboard(
  period: DashboardPeriod = DEFAULT_DASHBOARD_PERIOD
): Promise<VenueDashboardData> {
  const response = await fetch(
    `/api/venues/dashboard?period=${period}`,
    { cache: 'no-store' } // Для server components
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch venue dashboard');
  }
  
  return response.json();
}
```

### 3. Context Provider

```typescript
// src/features/venue-dashboard/context/VenueDashboardProvider.tsx
'use client';

interface VenueDashboardContextValue {
  data: VenueDashboardData | null;
  period: DashboardPeriod;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: DashboardPeriod) => void;
  refresh: () => Promise<void>;
}

interface VenueDashboardProviderProps {
  children: React.ReactNode;
  initialData: VenueDashboardData | null;
  initialPeriod?: DashboardPeriod;
  initialError?: string | null;
}

export function VenueDashboardProvider({
  children,
  initialData,
  initialPeriod = DEFAULT_DASHBOARD_PERIOD,
  initialError = null,
}: VenueDashboardProviderProps) {
  const [data, setData] = useState<VenueDashboardData | null>(initialData);
  const [period, setPeriodState] = useState<DashboardPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const inFlightRef = useRef<string | null>(null);

  const fetchData = useCallback(async (newPeriod: DashboardPeriod) => {
    // Prevent duplicate in-flight requests
    if (inFlightRef.current === newPeriod) {
      return;
    }

    inFlightRef.current = newPeriod;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/venues/dashboard?period=${newPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      inFlightRef.current = null;
    }
  }, []);

  const setPeriod = useCallback((newPeriod: DashboardPeriod) => {
    setPeriodState(newPeriod);
    fetchData(newPeriod);
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(period);
  }, [fetchData, period]);

  const value: VenueDashboardContextValue = {
    data,
    period,
    isLoading,
    error,
    setPeriod,
    refresh,
  };

  return (
    <VenueDashboardContext.Provider value={value}>
      {children}
    </VenueDashboardContext.Provider>
  );
}
```

### 4. Hook

```typescript
// src/features/venue-dashboard/hooks/useVenueDashboard.ts
'use client';

export function useVenueDashboard() {
  const context = useContext(VenueDashboardContext);
  
  if (!context) {
    throw new Error('useVenueDashboard must be used within VenueDashboardProvider');
  }
  
  return context;
}
```

### 5. Layout Refactoring

```typescript
// src/app/venue/(dashboard)/layout.tsx
import { VenueDashboardProvider } from '@/features/venue-dashboard/context/VenueDashboardProvider';
import { getVenueDashboard } from '@/features/venue-dashboard/api/getVenueDashboard';
import { DEFAULT_DASHBOARD_PERIOD } from '@/features/venue-dashboard/constants';

export default async function VenueLayout({ children }: { children: React.ReactNode }) {
  // Server-side fetch
  let initialData = null;
  let initialError = null;

  try {
    initialData = await getVenueDashboard(DEFAULT_DASHBOARD_PERIOD);
  } catch (error) {
    initialError = error instanceof Error ? error.message : 'Failed to load dashboard';
  }

  return (
    <VenueDashboardProvider 
      initialData={initialData}
      initialPeriod={DEFAULT_DASHBOARD_PERIOD}
      initialError={initialError}
    >
      {/* Existing layout UI */}
      <div className="min-h-screen relative">
        {/* ... sidebar, navigation, etc ... */}
        <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
      </div>
    </VenueDashboardProvider>
  );
}
```

## Data Models

### VenueDashboardData

```typescript
interface VenueDashboardData {
  venue: {
    id: string;
    name: string;
    distributionMode: 'PERSONAL' | 'POOLED';
  };
  metrics: {
    totalTips: number;
    transactionCount: number;
    averageTip: number;
    activeStaff: number;
  };
  topStaff: Array<{
    id: string;
    displayName: string;
    totalTips: number;
    tipsCount: number;
  }>;
  hasPendingPayouts: boolean;
}
```

### DashboardPeriod

```typescript
type DashboardPeriod = 'today' | 'week' | 'month';
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single Request on Load

*For any* navigation to venue dashboard, exactly one request to `/api/venues/dashboard` should be made during initial load.

**Validates: Requirements 1.1, 1.2**

### Property 2: Shared State Consistency

*For any* two components using `useVenueDashboard()` at the same time, both should receive the same data instance (referential equality).

**Validates: Requirements 3.5**

### Property 3: In-Flight Request Deduplication

*For any* period value, if a request for that period is already in progress, subsequent calls to fetch the same period should not trigger additional requests.

**Validates: Requirements 5.4**

### Property 4: Default Period Consistency

*For any* request to `/api/venues/dashboard` without a period parameter, the system should treat it as `period=week`.

**Validates: Requirements 2.2, 2.3**

## Error Handling

### Server Fetch Errors

- Layout catches errors during server fetch
- Passes error state to Provider via `initialError` prop
- Provider displays error state to all consumers
- Previous data preserved if available

### Client Fetch Errors

- Provider catches errors during client-side refresh
- Updates error state in context
- Preserves previous data if available
- Consumers can display error UI based on error state

### Network Failures

- Fetch with timeout (default browser timeout)
- Retry logic can be added to Provider if needed
- Error messages are user-friendly

## Testing Strategy

### Unit Tests

- Test `getVenueDashboard` fetcher with different periods
- Test Provider state management (period changes, refresh)
- Test `useVenueDashboard` hook throws error outside Provider
- Test in-flight request deduplication logic
- Test error handling in Provider

### Integration Tests

- Test Layout server fetch and Provider initialization
- Test multiple components reading from same Provider
- Test period change triggers new fetch
- Test refresh method updates all consumers

### Property-Based Tests

- Property 1: Single request on load (monitor network calls)
- Property 2: Shared state consistency (compare references)
- Property 3: In-flight deduplication (concurrent requests)
- Property 4: Default period (requests without period param)

### Manual Testing

- Open DevTools Network tab
- Navigate to `/venue/dashboard`
- Verify only 1 request to `/api/venues/dashboard?period=week`
- Navigate between dashboard pages
- Verify no additional requests
- Change period filter
- Verify new request with correct period
- Check loading states and error states

## Migration Strategy

### Phase 1: Create Infrastructure

1. Create constants file
2. Create API fetcher
3. Create Provider and hook
4. Add tests for new code

### Phase 2: Refactor Layout

1. Convert layout to async server component
2. Add server fetch
3. Wrap children in Provider
4. Test layout in isolation

### Phase 3: Refactor Consumers

1. Update `useDashboardData` to use context
2. Update Dashboard page
3. Update QR Codes page
4. Update Settings page
5. Update `useStaffManagement` hook
6. Test each page after refactoring

### Phase 4: Cleanup

1. Remove old fetch logic
2. Remove unused code
3. Update tests
4. Verify no regressions

## Performance Considerations

- Server fetch is faster than client fetch (no round-trip)
- Single request reduces network overhead by 80%
- Context updates are efficient (React optimization)
- In-flight guard prevents unnecessary requests
- Data is cached in Provider state (no re-fetching on re-renders)

## Security Considerations

- Server fetch uses server-side auth (cookies)
- Client fetch uses same auth mechanism
- No sensitive data exposed in client state
- Error messages don't leak sensitive info
