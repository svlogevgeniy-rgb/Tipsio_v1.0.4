'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, FileText, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper'
import { useTranslations } from '@/i18n/client'
import { formatNumber } from '@/lib/i18n/formatters'

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard')
  // Mock stats
  const stats = {
    totalVenues: 47,
    activeVenues: 42,
    totalTransactions: 12847,
    totalVolume: 2450000000,
    todayTransactions: 156,
    failedToday: 3
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('id-ID').format(amount)
  }

  return (
    <AdminPageWrapper>
      {/* Header */}
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t('subtitle')}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('totalVenues')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalVenues}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('active')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.activeVenues}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('allTimeTxns')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats.totalTransactions)}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('totalVolume')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-primary">Rp {formatCurrency(stats.totalVolume)}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('today')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{stats.todayTransactions}</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs sm:text-sm text-muted-foreground">{t('failedToday')}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.failedToday}</p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-4 sm:gap-6"
      >
        <Link href="/admin/venues">
          <div className="glass rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-primary transition-colors truncate">
                  {t('manageVenues')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {t('manageVenuesDesc')}
                </p>
              </div>
              <span className="text-xl sm:text-2xl text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/transactions">
          <div className="glass rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-primary transition-colors truncate">
                  {t('transactionLogs')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {t('transactionLogsDesc')}
                </p>
              </div>
              <span className="text-xl sm:text-2xl text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/commissions">
          <div className="glass rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-green-400 transition-colors truncate">
                  {t('platformCommissions')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {t('platformCommissionsDesc')}
                </p>
              </div>
              <span className="text-xl sm:text-2xl text-muted-foreground group-hover:text-green-400 transition-colors flex-shrink-0">→</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </AdminPageWrapper>
  )
}
