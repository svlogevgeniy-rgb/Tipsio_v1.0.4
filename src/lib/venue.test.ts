import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { 
  shouldAutoGenerateVenueQr, 
  createVenueQrData, 
  validatePooledVenueHasQr,
  DistributionMode,
  QrCode
} from './venue';

/**
 * **Feature: tipsio-refactor-v2, Property 4: Автогенерация QR для режима "Единая кубышка"**
 * 
 * *Для любого* заведения с distributionMode = POOLED, должен существовать
 * автоматически сгенерированный QR-код типа VENUE.
 * 
 * **Validates: Requirements 3.2**
 */
describe('Property 4: Auto-generate QR for POOLED mode', () => {
  const alphanumeric = fc.stringMatching(/^[a-zA-Z0-9]+$/);
  const shortCodeArb = alphanumeric.filter(s => s.length >= 6 && s.length <= 10);
  const venueNameArb = alphanumeric.filter(s => s.length >= 2);

  it('should require QR auto-generation for POOLED mode', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        (mode) => {
          expect(shouldAutoGenerateVenueQr(mode)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not require QR auto-generation for PERSONAL mode', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        (mode) => {
          expect(shouldAutoGenerateVenueQr(mode)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create venue QR with correct type and label', () => {
    fc.assert(
      fc.property(
        venueNameArb,
        shortCodeArb,
        (venueName, shortCode) => {
          const qr = createVenueQrData(venueName, shortCode);
          
          expect(qr.type).toBe('VENUE');
          expect(qr.label).toBe(venueName);
          expect(qr.shortCode).toBe(shortCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate POOLED venue has venue-level QR', () => {
    fc.assert(
      fc.property(
        venueNameArb,
        shortCodeArb,
        (venueName, shortCode) => {
          const venueQr = createVenueQrData(venueName, shortCode);
          const qrCodes: QrCode[] = [venueQr];
          
          // POOLED venue with venue QR should be valid
          expect(validatePooledVenueHasQr('POOLED', qrCodes)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation for POOLED venue without venue-level QR', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        (mode) => {
          const emptyQrCodes: QrCode[] = [];
          expect(validatePooledVenueHasQr(mode, emptyQrCodes)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation for PERSONAL venue regardless of QR codes', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        fc.array(fc.record({
          type: fc.constantFrom('VENUE' as const, 'PERSONAL' as const, 'TABLE' as const),
          label: venueNameArb,
          shortCode: shortCodeArb,
        })),
        (mode, qrCodes) => {
          // PERSONAL mode doesn't require venue QR
          expect(validatePooledVenueHasQr(mode, qrCodes)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
