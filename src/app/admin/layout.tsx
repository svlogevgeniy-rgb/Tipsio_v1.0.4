import { AdminGuard } from '@/components/admin/AdminGuard'
import { SessionProvider } from '@/components/providers/session-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </SessionProvider>
  )
}
