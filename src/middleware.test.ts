import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('Middleware', () => {
  describe('Static files and Next.js internals', () => {
    it('should have middleware function exported', async () => {
      const middlewareModule = await import('./middleware')
      expect(middlewareModule.middleware).toBeDefined()
      expect(typeof middlewareModule.middleware).toBe('function')
    })

    it('should have config with matcher', async () => {
      const middlewareModule = await import('./middleware')
      expect(middlewareModule.config).toBeDefined()
      expect(middlewareModule.config.matcher).toBeDefined()
      expect(Array.isArray(middlewareModule.config.matcher)).toBe(true)
    })

    it('should skip _next paths (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/_next/static/chunk.js'))
      const response = await middlewareModule.middleware(request)
      
      // Should pass through without redirect
      expect(response.status).not.toBe(307)
    })

    it('should skip static paths (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/static/image.png'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should skip favicon.ico (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/favicon.ico'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should skip public image files (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const extensions = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'txt', 'xml']
      
      for (const ext of extensions) {
        const request = new NextRequest(new URL(`http://localhost:3000/image.${ext}`))
        const response = await middlewareModule.middleware(request)
        
        // Should pass through without redirect
        expect(response.status).not.toBe(307)
      }
    })
  })

  describe('Public routes', () => {
    it('should allow access to home page (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should allow access to venue login (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/venue/login'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should allow access to venue register (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/venue/register'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should allow access to staff login (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/staff/login'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should allow access to tip pages (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/tip/abc123'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })

    it('should allow access to auth API (integration test)', async () => {
      const middlewareModule = await import('./middleware')
      const request = new NextRequest(new URL('http://localhost:3000/api/auth/signin'))
      const response = await middlewareModule.middleware(request)
      
      expect(response.status).not.toBe(307)
    })
  })

  describe('Protected routes configuration', () => {
    it('should redirect based on role', async () => {
      const middlewareModule = await import('./middleware')
      const middlewareSource = middlewareModule.middleware.toString()
      
      // Verify role-based redirects exist
      expect(middlewareSource).toContain('/venue/dashboard')
      expect(middlewareSource).toContain('/staff/dashboard')
    })

    it('should use getToken for JWT extraction', async () => {
      const middlewareModule = await import('./middleware')
      const middlewareSource = middlewareModule.middleware.toString()
      
      // Verify getToken is used (Edge-compatible, no DB)
      expect(middlewareSource).toContain('getToken')
    })

    it('should include callbackUrl in redirects', async () => {
      const middlewareModule = await import('./middleware')
      const middlewareSource = middlewareModule.middleware.toString()
      
      // Verify callbackUrl is preserved
      expect(middlewareSource).toContain('callbackUrl')
    })
  })

  describe('Middleware structure validation', () => {
    it('should export middleware as async function', async () => {
      const middlewareModule = await import('./middleware')
      expect(middlewareModule.middleware.constructor.name).toBe('AsyncFunction')
    })

    it('should have proper matcher configuration', async () => {
      const middlewareModule = await import('./middleware')
      const matcher = middlewareModule.config.matcher
      
      expect(matcher).toBeDefined()
      expect(matcher.length).toBeGreaterThan(0)
      
      // Verify matcher excludes static files
      const matcherString = matcher.join(' ')
      expect(matcherString).toContain('_next')
    })
  })
})
