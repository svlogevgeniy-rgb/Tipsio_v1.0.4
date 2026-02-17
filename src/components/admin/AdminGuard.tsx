'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AdminLayout } from './AdminLayout'

interface AdminGuardProps {
  children: React.ReactNode
  loadingComponent?: React.ReactNode
}

/**
 * AdminGuard component prevents unauthorized access to admin pages
 * and prevents content flash before redirect
 * 
 * Requirements: 4.2, 4.3, 4.4
 */
export function AdminGuard({ children, loadingComponent }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return

    // No session - redirect to login
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname || '/admin')
      router.push(`/venue/login?callbackUrl=${callbackUrl}`)
      return
    }

    // Check role authorization
    if (session.user.role !== 'ADMIN') {
      // Redirect based on role
      if (session.user.role === 'MANAGER') {
        router.push('/venue/dashboard')
      } else if (session.user.role === 'STAFF') {
        router.push('/staff/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [session, status, router, pathname])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated or not authorized
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  // User is authenticated and authorized - render children with layout
  // AdminLayout is inside SessionProvider context, so useSession will work
  return <AdminLayout>{children}</AdminLayout>
}
