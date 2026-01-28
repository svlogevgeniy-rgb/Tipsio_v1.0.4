import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingNavigation } from '../LandingNavigation'

// Mock next-intl
vi.mock('@/i18n/client', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'nav.login': 'Войти',
      'nav.cta': 'Подключить',
    }
    return translations[key] || key
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

// Mock LanguageSwitcher
vi.mock('@/components/ui/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}))

describe('LandingNavigation', () => {
  it('should render login button with correct href', () => {
    render(<LandingNavigation />)
    
    const loginLink = screen.getByRole('link', { name: /войти/i })
    expect(loginLink).toHaveAttribute('href', '/venue/login')
  })

  it('should not render products dropdown', () => {
    render(<LandingNavigation />)
    
    // Check that there's no "Продукты" text or dropdown trigger
    expect(screen.queryByText(/продукты/i)).not.toBeInTheDocument()
  })

  it('should not render login dropdown menu items', () => {
    render(<LandingNavigation />)
    
    // These should not be visible in the simplified navigation
    expect(screen.queryByText(/для заведений/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/для персонала/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/для гостя/i)).not.toBeInTheDocument()
  })

  it('should render CTA button', () => {
    render(<LandingNavigation />)
    
    const ctaLink = screen.getByRole('link', { name: /подключить/i })
    expect(ctaLink).toHaveAttribute('href', '/venue/register')
  })

  it('should render logo', () => {
    render(<LandingNavigation />)
    
    const logo = screen.getByAltText('TIPSIO Logo')
    expect(logo).toBeInTheDocument()
  })

  it('should render language switcher', () => {
    render(<LandingNavigation />)
    
    const languageSwitchers = screen.getAllByTestId('language-switcher')
    expect(languageSwitchers.length).toBeGreaterThan(0)
  })
})
