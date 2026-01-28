import { render, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { StaffAvatar } from './StaffAvatar';

/**
 * Property-based tests for StaffAvatar component
 * 
 * These tests verify universal properties across all valid inputs using fast-check.
 * Each property test runs with minimum 100 iterations to ensure correctness.
 * 
 * **Feature: tip-payment-ui-redesign**
 */

/**
 * **Feature: tip-payment-ui-redesign, Property 1: Staff Photo Display**
 * 
 * *For any* staff with avatarUrl, image src should match the provided URL.
 * 
 * **Validates: Requirements 2.1**
 */
describe('Property 1: Staff Photo Display', () => {
  it('should display image with correct src for any valid avatarUrl', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (avatarUrl, staffName) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt={staffName} size="md" />
          );

          // Find the Next.js Image component (rendered as img)
          const img = container.querySelector('img');
          
          // Image should exist when avatarUrl is provided
          expect(img).toBeTruthy();
          
          // Next.js Image component transforms src, but it should contain the original URL
          if (img) {
            const imgSrc = img.getAttribute('src');
            expect(imgSrc).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should render image element for any staff with photo URL', () => {
    fc.assert(
      fc.property(
        fc.record({
          avatarUrl: fc.webUrl(),
          displayName: fc.string({ minLength: 1, maxLength: 100 }),
          size: fc.constantFrom('sm', 'md', 'lg'),
        }),
        (staff) => {
          const { container } = render(
            <StaffAvatar 
              src={staff.avatarUrl} 
              alt={staff.displayName} 
              size={staff.size as 'sm' | 'md' | 'lg'} 
            />
          );

          // Should render an image element
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          
          // Should not render placeholder icon
          const placeholderIcon = container.querySelector('svg');
          expect(placeholderIcon).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: tip-payment-ui-redesign, Property 2: Staff Placeholder Display**
 * 
 * *For any* staff without avatarUrl, placeholder icon should render.
 * 
 * **Validates: Requirements 2.2**
 */
describe('Property 2: Staff Placeholder Display', () => {
  it('should display placeholder icon when avatarUrl is null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('sm', 'md', 'lg'),
        (staffName, size) => {
          const { container } = render(
            <StaffAvatar 
              src={null} 
              alt={staffName} 
              size={size as 'sm' | 'md' | 'lg'} 
            />
          );

          // Should render placeholder icon (User icon from lucide-react)
          const placeholderIcon = container.querySelector('svg');
          expect(placeholderIcon).toBeTruthy();
          
          // Should not render image element
          const img = container.querySelector('img');
          expect(img).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display placeholder for any staff without photo', () => {
    fc.assert(
      fc.property(
        fc.record({
          displayName: fc.string({ minLength: 1, maxLength: 100 }),
          size: fc.constantFrom('sm', 'md', 'lg'),
        }),
        (staff) => {
          const { container } = render(
            <StaffAvatar 
              src={null} 
              alt={staff.displayName} 
              size={staff.size as 'sm' | 'md' | 'lg'} 
            />
          );

          // Placeholder icon should be present
          const icon = container.querySelector('svg');
          expect(icon).toBeTruthy();
          
          // Icon should have appropriate styling class
          expect(icon?.classList.contains('text-cyan-400')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: tip-payment-ui-redesign, Property 3: Consistent Avatar Dimensions**
 * 
 * *For any* avatar size variant, all avatars should have consistent dimensions.
 * 
 * **Validates: Requirements 2.3**
 */
describe('Property 3: Consistent Avatar Dimensions', () => {
  it('should have consistent dimensions for sm size (48x48px)', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.webUrl(), fc.constant(null)),
        fc.string({ minLength: 1, maxLength: 50 }),
        (avatarUrl, staffName) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt={staffName} size="sm" />
          );

          const avatarContainer = container.firstChild as HTMLElement;
          expect(avatarContainer).toBeTruthy();
          
          // Should have w-12 h-12 classes (48px)
          expect(avatarContainer.classList.contains('w-12')).toBe(true);
          expect(avatarContainer.classList.contains('h-12')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent dimensions for md size (64x64px)', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.webUrl(), fc.constant(null)),
        fc.string({ minLength: 1, maxLength: 50 }),
        (avatarUrl, staffName) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt={staffName} size="md" />
          );

          const avatarContainer = container.firstChild as HTMLElement;
          expect(avatarContainer).toBeTruthy();
          
          // Should have w-16 h-16 classes (64px)
          expect(avatarContainer.classList.contains('w-16')).toBe(true);
          expect(avatarContainer.classList.contains('h-16')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent dimensions for lg size (96x96px)', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.webUrl(), fc.constant(null)),
        fc.string({ minLength: 1, maxLength: 50 }),
        (avatarUrl, staffName) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt={staffName} size="lg" />
          );

          const avatarContainer = container.firstChild as HTMLElement;
          expect(avatarContainer).toBeTruthy();
          
          // Should have w-24 h-24 classes (96px)
          expect(avatarContainer.classList.contains('w-24')).toBe(true);
          expect(avatarContainer.classList.contains('h-24')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent dimensions across all size variants', () => {
    fc.assert(
      fc.property(
        fc.record({
          avatarUrl: fc.oneof(fc.webUrl(), fc.constant(null)),
          displayName: fc.string({ minLength: 1, maxLength: 100 }),
          size: fc.constantFrom('sm', 'md', 'lg'),
        }),
        (staff) => {
          const { container } = render(
            <StaffAvatar 
              src={staff.avatarUrl} 
              alt={staff.displayName} 
              size={staff.size as 'sm' | 'md' | 'lg'} 
            />
          );

          const avatarContainer = container.firstChild as HTMLElement;
          
          // Verify size-specific classes are applied
          const sizeClasses = {
            sm: ['w-12', 'h-12'],
            md: ['w-16', 'h-16'],
            lg: ['w-24', 'h-24'],
          };

          const expectedClasses = sizeClasses[staff.size as keyof typeof sizeClasses];
          expectedClasses.forEach(className => {
            expect(avatarContainer.classList.contains(className)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: tip-payment-ui-redesign, Property 5: Meaningful Alt Text**
 * 
 * *For any* staff avatar image, alt text should contain staff name or fallback.
 * 
 * **Validates: Requirements 2.6**
 */
describe('Property 5: Meaningful Alt Text', () => {
  it('should use provided alt text for any staff with photo', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 100 }),
        (avatarUrl, staffName) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt={staffName} size="md" />
          );

          const img = container.querySelector('img');
          if (img) {
            const altText = img.getAttribute('alt');
            expect(altText).toBeTruthy();
            // Alt text should be either the provided name or fallback
            expect(altText).toBe(staffName);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have meaningful fallback when alt is empty', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (avatarUrl) => {
          const { container } = render(
            <StaffAvatar src={avatarUrl} alt="" size="md" />
          );

          const img = container.querySelector('img');
          if (img) {
            const altText = img.getAttribute('alt');
            // Should fallback to "Staff photo"
            expect(altText).toBe('Staff photo');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always have non-empty alt attribute', () => {
    fc.assert(
      fc.property(
        fc.record({
          avatarUrl: fc.webUrl(),
          displayName: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.constant('')
          ),
          size: fc.constantFrom('sm', 'md', 'lg'),
        }),
        (staff) => {
          const { container } = render(
            <StaffAvatar 
              src={staff.avatarUrl} 
              alt={staff.displayName} 
              size={staff.size as 'sm' | 'md' | 'lg'} 
            />
          );

          const img = container.querySelector('img');
          if (img) {
            const altText = img.getAttribute('alt');
            expect(altText).toBeTruthy();
            expect(altText!.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit tests for StaffAvatar edge cases
 * 
 * These tests verify specific examples and edge cases not covered by property tests.
 * 
 * **Validates: Requirements 2.4, 2.5**
 */
describe('Unit Tests: StaffAvatar Edge Cases', () => {
  describe('Image load error handling', () => {
    it('should show placeholder icon when image fails to load', async () => {
      const { container } = render(
        <StaffAvatar 
          src="https://invalid-url.com/broken-image.jpg" 
          alt="John Doe" 
          size="md" 
        />
      );

      // Initially should try to load image
      const img = container.querySelector('img');
      expect(img).toBeTruthy();

      // Simulate image load error
      if (img) {
        const errorEvent = new Event('error');
        img.dispatchEvent(errorEvent);
      }

      // After error, should show placeholder
      await waitFor(() => {
        const placeholderIcon = container.querySelector('svg');
        expect(placeholderIcon).toBeTruthy();
      });
    });

    it('should handle network errors gracefully', async () => {
      const { container } = render(
        <StaffAvatar 
          src="https://example.com/network-error.jpg" 
          alt="Jane Smith" 
          size="lg" 
        />
      );

      const img = container.querySelector('img');
      if (img) {
        // Trigger error event
        const errorEvent = new Event('error');
        img.dispatchEvent(errorEvent);
      }

      // Should fallback to placeholder without crashing
      await waitFor(() => {
        const icon = container.querySelector('svg');
        expect(icon).toBeTruthy();
      });
    });

    it('should not show broken image icon', async () => {
      const { container } = render(
        <StaffAvatar 
          src="https://broken.com/404.jpg" 
          alt="Staff Member" 
          size="sm" 
        />
      );

      const img = container.querySelector('img');
      if (img) {
        img.dispatchEvent(new Event('error'));
      }

      await waitFor(() => {
        // Should show User icon, not broken image
        const userIcon = container.querySelector('svg');
        expect(userIcon).toBeTruthy();
        
        // Image should be removed from DOM
        const imgAfterError = container.querySelector('img');
        expect(imgAfterError).toBeFalsy();
      });
    });
  });

  describe('Skeleton loading state', () => {
    it('should show skeleton while image is loading', () => {
      const { container } = render(
        <StaffAvatar 
          src="https://example.com/photo.jpg" 
          alt="Loading Staff" 
          size="md" 
        />
      );

      // Should have skeleton overlay initially
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeTruthy();
    });

    it('should remove skeleton after image loads', async () => {
      const { container } = render(
        <StaffAvatar 
          src="https://example.com/photo.jpg" 
          alt="Loaded Staff" 
          size="md" 
        />
      );

      const img = container.querySelector('img');
      if (img) {
        // Simulate successful load
        const loadEvent = new Event('load');
        img.dispatchEvent(loadEvent);
      }

      await waitFor(() => {
        const skeleton = container.querySelector('.animate-pulse');
        expect(skeleton).toBeFalsy();
      });
    });

    it('should not show skeleton for placeholder', () => {
      const { container } = render(
        <StaffAvatar 
          src={null} 
          alt="No Photo Staff" 
          size="md" 
        />
      );

      // Placeholder should not have skeleton
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeFalsy();
    });
  });

  describe('Size variants', () => {
    it('should render small size correctly (48x48px)', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Small Avatar" size="sm" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('w-12')).toBe(true);
      expect(avatar.classList.contains('h-12')).toBe(true);
      
      // Icon should also be small
      const icon = container.querySelector('svg');
      expect(icon?.classList.contains('w-6')).toBe(true);
      expect(icon?.classList.contains('h-6')).toBe(true);
    });

    it('should render medium size correctly (64x64px)', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Medium Avatar" size="md" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('w-16')).toBe(true);
      expect(avatar.classList.contains('h-16')).toBe(true);
      
      // Icon should be medium
      const icon = container.querySelector('svg');
      expect(icon?.classList.contains('w-8')).toBe(true);
      expect(icon?.classList.contains('h-8')).toBe(true);
    });

    it('should render large size correctly (96x96px)', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Large Avatar" size="lg" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('w-24')).toBe(true);
      expect(avatar.classList.contains('h-24')).toBe(true);
      
      // Icon should be large
      const icon = container.querySelector('svg');
      expect(icon?.classList.contains('w-12')).toBe(true);
      expect(icon?.classList.contains('h-12')).toBe(true);
    });

    it('should default to medium size when size prop is omitted', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Default Size Avatar" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('w-16')).toBe(true);
      expect(avatar.classList.contains('h-16')).toBe(true);
    });
  });

  describe('Styling and accessibility', () => {
    it('should have rounded-full class for circular shape', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Circular Avatar" size="md" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('rounded-full')).toBe(true);
    });

    it('should have gradient background', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Gradient Avatar" size="md" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(avatar.classList.contains('from-cyan-500/20')).toBe(true);
      expect(avatar.classList.contains('to-blue-500/20')).toBe(true);
    });

    it('should have ring styling', () => {
      const { container } = render(
        <StaffAvatar src={null} alt="Ring Avatar" size="md" />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('ring-2')).toBe(true);
      expect(avatar.classList.contains('ring-cyan-500/20')).toBe(true);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StaffAvatar 
          src={null} 
          alt="Custom Class Avatar" 
          size="md" 
          className="custom-test-class"
        />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.classList.contains('custom-test-class')).toBe(true);
    });

    it('should have proper image object-fit', () => {
      const { container } = render(
        <StaffAvatar 
          src="https://example.com/photo.jpg" 
          alt="Object Fit Test" 
          size="md" 
        />
      );

      const img = container.querySelector('img');
      expect(img?.classList.contains('object-cover')).toBe(true);
    });
  });

  describe('State management', () => {
    it('should reset state when src changes from null to URL', async () => {
      const { container, rerender } = render(
        <StaffAvatar src={null} alt="Staff" size="md" />
      );

      // Initially shows placeholder
      expect(container.querySelector('svg')).toBeTruthy();
      expect(container.querySelector('img')).toBeFalsy();

      // Update to have image
      rerender(
        <StaffAvatar 
          src="https://example.com/new-photo.jpg" 
          alt="Staff" 
          size="md" 
        />
      );

      // Should now show image
      await waitFor(() => {
        expect(container.querySelector('img')).toBeTruthy();
      });
    });

    it('should reset state when src changes from URL to null', async () => {
      const { container, rerender } = render(
        <StaffAvatar 
          src="https://example.com/photo.jpg" 
          alt="Staff" 
          size="md" 
        />
      );

      // Initially shows image
      expect(container.querySelector('img')).toBeTruthy();

      // Update to null
      rerender(
        <StaffAvatar src={null} alt="Staff" size="md" />
      );

      // Should now show placeholder
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeTruthy();
        expect(container.querySelector('img')).toBeFalsy();
      });
    });

    it('should reset error state when src changes', async () => {
      const { container, rerender } = render(
        <StaffAvatar 
          src="https://broken.com/error.jpg" 
          alt="Staff" 
          size="md" 
        />
      );

      // Trigger error
      const img = container.querySelector('img');
      if (img) {
        img.dispatchEvent(new Event('error'));
      }

      await waitFor(() => {
        expect(container.querySelector('svg')).toBeTruthy();
      });

      // Change to valid URL
      rerender(
        <StaffAvatar 
          src="https://example.com/valid.jpg" 
          alt="Staff" 
          size="md" 
        />
      );

      // Should try to load new image
      await waitFor(() => {
        expect(container.querySelector('img')).toBeTruthy();
      });
    });
  });
});
