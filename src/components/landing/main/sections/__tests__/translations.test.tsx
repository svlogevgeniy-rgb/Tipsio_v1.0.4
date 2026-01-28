import { describe, it, expect } from 'vitest'

describe('Landing Page Translations', () => {
  describe('Russian translations', () => {
    const ruTranslations = require('@/../../messages/ru.json')

    it('should have updated Problem Section desc1', () => {
      expect(ruTranslations.landingV3.problem.desc1).toBe(
        'Гости хотят сказать «спасибо» за отличный сервис — но всё чаще у них с собой только карта или телефон. Когда нет удобного способа оставить чаевые, эти «спасибо» так и остаются словами, а ваша команда теряет доход.'
      )
    })

    it('should have updated Problem Section desc2', () => {
      expect(ruTranslations.landingV3.problem.desc2).toBe(
        'превращает фразу «Извините, у меня только карта» в реальные чаевые для персонала — быстро, удобно и без неловкости.'
      )
    })

    it('should have updated Product Demo title', () => {
      expect(ruTranslations.landingV3.productDemo.title).toBe('Понятно каждому гостю')
    })

    it('should have updated Product Demo point1', () => {
      expect(ruTranslations.landingV3.productDemo.point1).toBe('Мультиязычный интерфейс')
    })

    it('should have updated Product Demo point2', () => {
      expect(ruTranslations.landingV3.productDemo.point2).toBe('Без приложений и аккаунтов')
    })

    it('should have updated Product Demo point3', () => {
      expect(ruTranslations.landingV3.productDemo.point3).toBe(
        'Оптимальные суммы — больше чаевых без усилий'
      )
    })

    it('should have updated Benefits business desc', () => {
      expect(ruTranslations.landingV3.benefits.business.desc).toBe(
        'Когда у персонала есть удобный и прозрачный способ получать чаевые от гостей, которые платят картой, работа ощущается более справедливой, а благодарность — реальной.'
      )
    })

    it('should have updated Benefits guests desc', () => {
      expect(ruTranslations.landingV3.benefits.guests.desc).toBe(
        'Никакого чувства вины из-за отсутствия наличных денег. Оплата в пару кликов!'
      )
    })

    it('should have updated FAQ title', () => {
      expect(ruTranslations.landingV3.faq.title).toBe('FAQ')
    })

    it('should have updated FAQ q1 question', () => {
      expect(ruTranslations.landingV3.faq.q1.q).toBe('Нужно ли открывать счёт в Midtrans?')
    })

    it('should have updated FAQ q3 answer', () => {
      expect(ruTranslations.landingV3.faq.q3.a).toBe(
        'Сейчас сервис полностью бесплатен. В будущем комиссия составит 10%.'
      )
    })
  })

  describe('Translation fallback', () => {
    it('should have all required translation keys', () => {
      const ruTranslations = require('@/../../messages/ru.json')
      
      expect(ruTranslations.landingV3).toBeDefined()
      expect(ruTranslations.landingV3.problem).toBeDefined()
      expect(ruTranslations.landingV3.productDemo).toBeDefined()
      expect(ruTranslations.landingV3.benefits).toBeDefined()
      expect(ruTranslations.landingV3.faq).toBeDefined()
    })
  })
})
