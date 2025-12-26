'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getLocale, setLocale } from '@/i18n/client'

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', shortCode: 'ID' },
  { code: 'en', name: 'English', shortCode: 'EN' },
  { code: 'ru', name: 'Русский', shortCode: 'RU' },
]

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<string | null>(null)

  useEffect(() => {
    setCurrentLocale(getLocale())
  }, [])

  const activeLanguage =
    languages.find(lang => lang.code === currentLocale) ?? null
  const displayedShortCode = activeLanguage?.shortCode ?? '...'
  const buttonAriaLabel = activeLanguage
    ? `Change language, current ${activeLanguage.name}`
    : 'Change language'

  const handleLocaleChange = (code: string) => {
    setLocale(code)
    setCurrentLocale(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={buttonAriaLabel}
          className="h-8 gap-1 rounded-[20px] px-2.5 text-xs font-semibold tracking-wide text-foreground"
        >
          {displayedShortCode}
          <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[3.5rem] border-border/60 p-1"
      >
        <DropdownMenuGroup>
          {languages.map((lang) => {
            const isActive = lang.code === currentLocale
            return (
              <DropdownMenuItem
                key={lang.code}
                onSelect={() => handleLocaleChange(lang.code)}
                role="menuitemradio"
                aria-checked={isActive}
                aria-label={lang.name}
                className={cn(
                  'flex items-center rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-primary/20 text-foreground'
                )}
              >
                {lang.shortCode}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
