interface AdminPageWrapperProps {
  children: React.ReactNode
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}
