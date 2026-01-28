'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Search, MoreVertical, Ban, CheckCircle, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react'
import { AuroraBackground } from '@/components/layout/aurora-background'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from '@/i18n/client'
import { formatCurrencyIDRIntl } from '@/lib/i18n/formatters'

interface Venue {
  id: string
  name: string
  area: string
  midtransStatus: 'LIVE' | 'TEST' | 'NOT_CONNECTED'
  status: 'ACTIVE' | 'BLOCKED'
  totalVolume: number
  lastActivity: string
  staffCount: number
}

export default function AdminVenuesPage() {
  const t = useTranslations('admin.venues')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const res = await fetch(`/api/admin/venues?${params.toString()}`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch venues`)
        }
        const data = await res.json()
        setVenues(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch venues'
        setError(message)
        console.error('Failed to fetch venues:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVenues()
  }, [search, statusFilter])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Trigger re-fetch by updating a dependency
    setSearch(prev => prev)
  }


  const handleBlock = async (venueId: string) => {
    const venue = venues.find(v => v.id === venueId)
    if (!venue) return

    const newStatus = venue.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
    
    try {
      const res = await fetch('/api/admin/venues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, status: newStatus })
      })
      
      if (res.ok) {
        setVenues(venues.map(v => 
          v.id === venueId ? { ...v, status: newStatus } : v
        ))
      }
    } catch (error) {
      console.error('Failed to update venue status:', error)
    }
  }

  const getMidtransStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🟢 {t('liveStatus')}</Badge>
      case 'TEST':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 {t('testStatus')}</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">⚪ {t('notConnected')}</Badge>
    }
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
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-heading font-bold text-white">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allVenues')}</SelectItem>
                  <SelectItem value="live">{t('live')}</SelectItem>
                  <SelectItem value="test">{t('testMode')}</SelectItem>
                  <SelectItem value="blocked">{t('blocked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>


          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('allVenues')}</p>
              <p className="text-2xl font-bold text-white">{venues.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('live')}</p>
              <p className="text-2xl font-bold text-green-400">
                {venues.filter(v => v.midtransStatus === 'LIVE' && v.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('testMode')}</p>
              <p className="text-2xl font-bold text-yellow-400">
                {venues.filter(v => v.midtransStatus === 'TEST').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('blocked')}</p>
              <p className="text-2xl font-bold text-red-400">
                {venues.filter(v => v.status === 'BLOCKED').length}
              </p>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('venue')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('midtrans')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('totalVolume')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('staffCount')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('lastActivity')}</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <div className="flex flex-col items-center gap-4">
                          <AlertTriangle className="w-8 h-8 text-red-400" />
                          <p className="text-red-400">{error}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRetry}
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : venues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No venues found
                      </td>
                    </tr>
                  ) : (
                    venues.map((venue, index) => (
                      <motion.tr
                        key={venue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                          venue.status === 'BLOCKED' ? 'opacity-60' : ''
                        }`}
                      >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">{venue.area}</p>
                        </div>
                      </td>
                      <td className="p-4">{getMidtransStatusBadge(venue.midtransStatus)}</td>
                      <td className="p-4">
                        <span className="text-primary font-medium">
                          {formatCurrencyIDRIntl(venue.totalVolume)}
                        </span>
                      </td>
                      <td className="p-4 text-white">{venue.staffCount}</td>
                      <td className="p-4 text-muted-foreground">{venue.lastActivity}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-white/10">
                            <DropdownMenuItem className="cursor-pointer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleBlock(venue.id)}
                            >
                              {venue.status === 'BLOCKED' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                  <span className="text-green-400">{t('unblock')}</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-2 text-red-400" />
                                  <span className="text-red-400">{t('block')}</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  )
}
