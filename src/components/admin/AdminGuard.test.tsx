import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state while checking session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when session is missing', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/venue/login?callbackUrl=%2Fadmin')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect MANAGER to /venue/dashboard', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'manager@test.com',
          role: 'MANAGER',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/venue/dashboard')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect STAFF to /staff/dashboard', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '2',
          email: 'staff@test.com',
          role: 'STAFF',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/staff/dashboard')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render content for ADMIN role', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '3',
          email: 'admin@test.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should use custom loading component when provided', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <AdminGuard loadingComponent={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </AdminGuard>
    )

    expect(screen.getByText('Custom Loading')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should redirect unknown role to home page', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '4',
          email: 'unknown@test.com',
          role: 'UNKNOWN_ROLE',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should not render content during loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should not render content for unauthenticated users', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should not render content for unauthorized roles', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '5',
          email: 'manager@test.com',
          role: 'MANAGER',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    })

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
