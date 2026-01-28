'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, FileText, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { AuroraBackground } from '@/components/layout/aurora-background'
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
    <AuroraBackground>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-heading font-bold text-white mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">{t('totalVenues')}</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalVenues}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <p className="text-sm text-muted-foreground">{t('active')}</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats.activeVenues}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">{t('allTimeTxns')}</p>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.totalTransactions)}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">{t('totalVolume')}</p>
              </div>
              <p className="text-2xl font-bold text-primary">Rp {formatCurrency(stats.totalVolume)}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-sm text-muted-foreground">{t('today')}</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.todayTransactions}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-muted-foreground">{t('failedToday')}</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.failedToday}</p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Link href="/admin/venues">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-semibold text-white group-hover:text-primary transition-colors">
                      {t('manageVenues')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('manageVenuesDesc')}
                    </p>
                  </div>
                  <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/transactions">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-semibold text-white group-hover:text-primary transition-colors">
                      {t('transactionLogs')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('transactionLogsDesc')}
                    </p>
                  </div>
                  <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/commissions">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-semibold text-white group-hover:text-green-400 transition-colors">
                      {t('platformCommissions')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('platformCommissionsDesc')}
                    </p>
                  </div>
                  <span className="text-2xl text-muted-foreground group-hover:text-green-400 transition-colors">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  )
}
