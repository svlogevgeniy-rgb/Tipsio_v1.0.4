import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import { AdminGuard } from './AdminGuard'

// Mock next-auth/react
const mockPush = vi.fn()
const mockUseSession = vi.fn()
const mockUseRouter = vi.fn(() => ({ push: mockPush }))
const mockUsePathname = vi.fn(() => '/admin')

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}))

describe('AdminGuard Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('Feature: admin-panel-security, Property 6: AdminGuard prevents content flash', () => {
    // Generators for different session states
    const sessionStateArb = fc.constantFrom(
      'loading',
      'unauthenticated',
      'authenticated-admin',
      'authenticated-manager',
      'authenticated-staff',
      'authenticated-unknown'
    )

    fc.assert(
      fc.property(sessionStateArb, (sessionState) => {
        // Setup session based on state
        switch (sessionState) {
          case 'loading':
            mockUseSession.mockReturnValue({
              data: null,
              status: 'loading',
            })
            break
          case 'unauthenticated':
            mockUseSession.mockReturnValue({
              data: null,
              status: 'unauthenticated',
            })
            break
          case 'authenticated-admin':
            mockUseSession.mockReturnValue({
              data: {
                user: {
                  id: 'admin-id',
                  email: 'admin@test.com',
                  role: 'ADMIN',
                },
                expires: '2024-12-31',
              },
              status: 'authenticated',
            })
            break
          case 'authenticated-manager':
            mockUseSession.mockReturnValue({
              data: {
                user: {
                  id: 'manager-id',
                  email: 'manager@test.com',
                  role: 'MANAGER',
                },
                expires: '2024-12-31',
              },
              status: 'authenticated',
            })
            break
          case 'authenticated-staff':
            mockUseSession.mockReturnValue({
              data: {
                user: {
                  id: 'staff-id',
                  email: 'staff@test.com',
                  role: 'STAFF',
                },
                expires: '2024-12-31',
              },
              status: 'authenticated',
            })
            break
          case 'authenticated-unknown':
            mockUseSession.mockReturnValue({
              data: {
                user: {
                  id: 'unknown-id',
                  email: 'unknown@test.com',
                  role: 'UNKNOWN',
                },
                expires: '2024-12-31',
              },
              status: 'authenticated',
            })
            break
        }

        const { container } = render(
          <AdminGuard>
            <div data-testid="protected-content">Secret Admin Content</div>
          </AdminGuard>
        )

        // Property: Content should ONLY be rendered for ADMIN role
        const protectedContent = container.querySelector('[data-testid="protected-content"]')
        
        if (sessionState === 'authenticated-admin') {
          // Only ADMIN should see content
          expect(protectedContent).not.toBeNull()
        } else {
          // All other states should NOT see content (prevents flash)
          expect(protectedContent).toBeNull()
        }

        // Cleanup
        vi.clearAllMocks()
      }),
      { numRuns: 100 }
    )
  })

  it('Property 6: Content never flashes for any unauthorized state', () => {
    // Generate various unauthorized session configurations
    const unauthorizedSessionArb = fc.oneof(
      // Loading state
      fc.constant({
        data: null,
        status: 'loading' as const,
      }),
      // Unauthenticated
      fc.constant({
        data: null,
        status: 'unauthenticated' as const,
      }),
      // Authenticated but wrong role
      fc.record({
        data: fc.record({
          user: fc.record({
            id: fc.string(),
            email: fc.emailAddress(),
            role: fc.constantFrom('MANAGER', 'STAFF', 'USER', 'GUEST', 'UNKNOWN'),
          }),
          expires: fc.constant('2024-12-31'),
        }),
        status: fc.constant('authenticated' as const),
      })
    )

    fc.assert(
      fc.property(unauthorizedSessionArb, (session) => {
        mockUseSession.mockReturnValue(session)

        const { container } = render(
          <AdminGuard>
            <div data-testid="secret-data">Confidential Information</div>
          </AdminGuard>
        )

        // Property: Protected content must NEVER be rendered for unauthorized users
        const secretData = container.querySelector('[data-testid="secret-data"]')
        expect(secretData).toBeNull()

        vi.clearAllMocks()
      }),
      { numRuns: 100 }
    )
  })

  it('Property 6: Loading state always shows loading UI, never content', () => {
    fc.assert(
      fc.property(fc.constant('loading'), () => {
        mockUseSession.mockReturnValue({
          data: null,
          status: 'loading',
        })

        const { unmount } = render(
          <AdminGuard>
            <div data-testid="protected">Protected Content</div>
          </AdminGuard>
        )

        // Property: During loading, show loading UI but never protected content
        expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
        expect(screen.queryByTestId('protected')).not.toBeInTheDocument()

        unmount()
        vi.clearAllMocks()
      }),
      { numRuns: 50 }
    )
  })

  it('Property 6: ADMIN role always renders content', () => {
    // Generate various ADMIN user configurations
    const adminUserArb = fc.record({
      id: fc.string({ minLength: 1 }),
      email: fc.emailAddress(),
      role: fc.constant('ADMIN' as const),
    })

    fc.assert(
      fc.property(adminUserArb, (user) => {
        mockUseSession.mockReturnValue({
          data: {
            user,
            expires: '2024-12-31',
          },
          status: 'authenticated',
        })

        const { unmount } = render(
          <AdminGuard>
            <div data-testid="admin-content">Admin Dashboard</div>
          </AdminGuard>
        )

        // Property: ADMIN role should ALWAYS see content
        expect(screen.getAllByTestId('admin-content').length).toBeGreaterThan(0)

        unmount()
        vi.clearAllMocks()
      }),
      { numRuns: 100 }
    )
  })

  it('Property 6: Non-ADMIN roles never render content', () => {
    // Generate various non-ADMIN user configurations
    const nonAdminUserArb = fc.record({
      id: fc.string({ minLength: 1 }),
      email: fc.emailAddress(),
      role: fc.constantFrom('MANAGER', 'STAFF', 'USER', 'GUEST'),
    })

    fc.assert(
      fc.property(nonAdminUserArb, (user) => {
        mockUseSession.mockReturnValue({
          data: {
            user,
            expires: '2024-12-31',
          },
          status: 'authenticated',
        })

        const { container } = render(
          <AdminGuard>
            <div data-testid="admin-content">Admin Dashboard</div>
          </AdminGuard>
        )

        // Property: Non-ADMIN roles should NEVER see content
        expect(container.querySelector('[data-testid="admin-content"]')).toBeNull()

        vi.clearAllMocks()
      }),
      { numRuns: 100 }
    )
  })
})
