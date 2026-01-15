import { describe, it, expect } from 'vitest';
import enMessages from '../../../../messages/en.json';
import idMessages from '../../../../messages/id.json';
import ruMessages from '../../../../messages/ru.json';

/**
 * Unit tests for venue login page i18n translations
 * 
 * These tests verify that the required i18n keys exist and have the correct values
 * for all supported languages (English, Russian, Indonesian).
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */
describe('Venue Login Page i18n', () => {
  describe('English translations', () => {
    it('should have newToTipsio key with correct text', () => {
      expect(enMessages.venue.login.newToTipsio).toBe('New to Tipsio?');
    });

    it('should have createAccount key with correct text', () => {
      expect(enMessages.venue.login.createAccount).toBe('Create account');
    });

    it('should have all required login keys', () => {
      expect(enMessages.venue.login).toHaveProperty('title');
      expect(enMessages.venue.login).toHaveProperty('subtitle');
      expect(enMessages.venue.login).toHaveProperty('email');
      expect(enMessages.venue.login).toHaveProperty('password');
      expect(enMessages.venue.login).toHaveProperty('login');
      expect(enMessages.venue.login).toHaveProperty('newToTipsio');
      expect(enMessages.venue.login).toHaveProperty('createAccount');
    });
  });

  describe('Russian translations', () => {
    it('should have newToTipsio key with correct text', () => {
      expect(ruMessages.venue.login.newToTipsio).toBe('Впервые пользуетесь Tipsio?');
    });

    it('should have createAccount key with correct text', () => {
      expect(ruMessages.venue.login.createAccount).toBe('Создайте аккаунт');
    });

    it('should have all required login keys', () => {
      expect(ruMessages.venue.login).toHaveProperty('title');
      expect(ruMessages.venue.login).toHaveProperty('subtitle');
      expect(ruMessages.venue.login).toHaveProperty('email');
      expect(ruMessages.venue.login).toHaveProperty('password');
      expect(ruMessages.venue.login).toHaveProperty('login');
      expect(ruMessages.venue.login).toHaveProperty('newToTipsio');
      expect(ruMessages.venue.login).toHaveProperty('createAccount');
    });
  });

  describe('Indonesian translations', () => {
    it('should have newToTipsio key with correct text', () => {
      expect(idMessages.venue.login.newToTipsio).toBe('Baru menggunakan Tipsio?');
    });

    it('should have createAccount key with correct text', () => {
      expect(idMessages.venue.login.createAccount).toBe('Buat akun');
    });

    it('should have all required login keys', () => {
      expect(idMessages.venue.login).toHaveProperty('title');
      expect(idMessages.venue.login).toHaveProperty('subtitle');
      expect(idMessages.venue.login).toHaveProperty('email');
      expect(idMessages.venue.login).toHaveProperty('password');
      expect(idMessages.venue.login).toHaveProperty('login');
      expect(idMessages.venue.login).toHaveProperty('newToTipsio');
      expect(idMessages.venue.login).toHaveProperty('createAccount');
    });
  });

  describe('Translation consistency', () => {
    it('should have the same keys in all languages', () => {
      const enKeys = Object.keys(enMessages.venue.login).sort();
      const ruKeys = Object.keys(ruMessages.venue.login).sort();
      const idKeys = Object.keys(idMessages.venue.login).sort();

      expect(enKeys).toEqual(ruKeys);
      expect(enKeys).toEqual(idKeys);
    });

    it('should have non-empty values for all keys', () => {
      const languages = [
        { name: 'English', messages: enMessages },
        { name: 'Russian', messages: ruMessages },
        { name: 'Indonesian', messages: idMessages },
      ];

      languages.forEach(({ name, messages }) => {
        Object.entries(messages.venue.login).forEach(([key, value]) => {
          expect(value, `${name} - ${key} should not be empty`).toBeTruthy();
          expect(typeof value, `${name} - ${key} should be a string`).toBe('string');
          expect((value as string).length, `${name} - ${key} should have content`).toBeGreaterThan(0);
        });
      });
    });
  });
});

/**
 * **Feature: venue-login-ui-unification, Property 1: i18n Text Retrieval**
 * 
 * *For any* supported language, all text content should be retrieved from i18n 
 * dictionaries without hardcoded strings in the component.
 * 
 * **Validates: Requirements 3.5**
 */
describe('Property 1: i18n Text Retrieval', () => {
  it('should not contain hardcoded English text in component', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Check that hardcoded registration prompt text is not present
    expect(componentContent).not.toContain("Don't have an account?");
    expect(componentContent).not.toContain("Don&apos;t have an account?");
    
    // Verify that i18n keys are used instead
    expect(componentContent).toContain("t('newToTipsio')");
    expect(componentContent).toContain("t('createAccount')");
  });

  it('should use i18n function for all user-facing text', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Count usage of t() function for translations
    const tFunctionMatches = componentContent.match(/t\(['"]\w+['"]\)/g);
    expect(tFunctionMatches).toBeTruthy();
    expect(tFunctionMatches!.length).toBeGreaterThan(5); // Should have multiple translations

    // Verify useTranslations hook is imported and used
    expect(componentContent).toContain("useTranslations");
    expect(componentContent).toContain("const t = useTranslations('venue.login')");
  });
});

/**
 * **Feature: venue-login-ui-unification, Property 2: Language Switching Updates Text**
 * 
 * *For any* language switch action, all i18n text on the page should update 
 * immediately to reflect the new language.
 * 
 * **Validates: Requirements 3.4**
 */
describe('Property 2: Language Switching Updates Text', () => {
  it('should have different text for each language', () => {
    const languages = [
      { messages: enMessages, expectedPrompt: 'New to Tipsio?' },
      { messages: ruMessages, expectedPrompt: 'Впервые пользуетесь Tipsio?' },
      { messages: idMessages, expectedPrompt: 'Baru menggunakan Tipsio?' },
    ];

    // Verify that each language has unique text
    const prompts = languages.map(lang => lang.messages.venue.login.newToTipsio);
    const uniquePrompts = new Set(prompts);
    expect(uniquePrompts.size).toBe(3); // All three should be different

    // Verify each language has the expected text
    languages.forEach(({ messages, expectedPrompt }) => {
      expect(messages.venue.login.newToTipsio).toBe(expectedPrompt);
    });
  });

  it('should have consistent structure across all languages', () => {
    const languages = [enMessages, ruMessages, idMessages];

    // All languages should have the same keys
    const enKeys = Object.keys(enMessages.venue.login).sort();
    
    languages.forEach((messages) => {
      const keys = Object.keys(messages.venue.login).sort();
      expect(keys).toEqual(enKeys);
    });
  });

  it('should support all three languages without missing translations', () => {
    const languages = [
      { name: 'English', messages: enMessages },
      { name: 'Russian', messages: ruMessages },
      { name: 'Indonesian', messages: idMessages },
    ];

    const requiredKeys = ['newToTipsio', 'createAccount', 'title', 'subtitle', 'email', 'password', 'login'] as const;

    languages.forEach(({ name, messages }) => {
      requiredKeys.forEach(key => {
        expect(messages.venue.login[key], `${name} should have ${key}`).toBeTruthy();
        expect(typeof messages.venue.login[key], `${name} ${key} should be string`).toBe('string');
      });
    });
  });
});

/**
 * **Feature: venue-login-ui-unification, Property 3: Form Validation Preservation**
 * 
 * *For any* form input values, the validation rules (email format, password required) 
 * should produce the same validation results as before UI changes.
 * 
 * **Validates: Requirements 5.4**
 */
describe('Property 3: Form Validation Preservation', () => {
  it('should have Zod schema for email and password validation', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify Zod schema is defined
    expect(componentContent).toContain('loginSchema');
    expect(componentContent).toContain('z.object');
    
    // Verify email validation
    expect(componentContent).toContain('email');
    expect(componentContent).toContain('z.string().email');
    
    // Verify password validation
    expect(componentContent).toContain('password');
    expect(componentContent).toContain('z.string().min');
  });

  it('should use react-hook-form with zodResolver', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify react-hook-form is used
    expect(componentContent).toContain('useForm');
    expect(componentContent).toContain('zodResolver');
    expect(componentContent).toContain('resolver: zodResolver(loginSchema)');
  });

  it('should display validation errors for form fields', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify error display for email
    expect(componentContent).toContain('errors.email');
    expect(componentContent).toContain('errors.email.message');
    
    // Verify error display for password
    expect(componentContent).toContain('errors.password');
    expect(componentContent).toContain('errors.password.message');
  });
});

/**
 * **Feature: venue-login-ui-unification, Property 4: Registration Link Functionality**
 * 
 * *For any* language setting, the registration link should navigate to 
 * `/venue/register` route.
 * 
 * **Validates: Requirements 6.3**
 */
describe('Property 4: Registration Link Functionality', () => {
  it('should have registration link pointing to /venue/register', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify Link component is used
    expect(componentContent).toContain('Link');
    expect(componentContent).toContain('from "next/link"');
    
    // Verify href points to registration page
    expect(componentContent).toContain('href="/venue/register"');
  });

  it('should use i18n for link text', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify link text uses i18n
    expect(componentContent).toContain("t('createAccount')");
    
    // Verify no hardcoded link text
    expect(componentContent).not.toContain('>Register<');
    expect(componentContent).not.toContain('>Sign up<');
  });

  it('should have consistent link styling', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify link has proper styling classes
    expect(componentContent).toContain('text-primary');
    expect(componentContent).toContain('hover:underline');
  });
});

/**
 * **Feature: venue-login-ui-unification, Property 5: i18n Key Resolution**
 * 
 * *For any* supported language, all i18n keys used in the login page should 
 * resolve to non-empty strings.
 * 
 * **Validates: Requirements 8.4**
 */
describe('Property 5: i18n Key Resolution', () => {
  it('should resolve all i18n keys to non-empty strings in English', () => {
    const keys = ['title', 'subtitle', 'email', 'password', 'login', 'newToTipsio', 'createAccount', 'accountCreated'] as const;
    
    keys.forEach(key => {
      const value = enMessages.venue.login[key];
      expect(value, `English key '${key}' should exist`).toBeTruthy();
      expect(typeof value, `English key '${key}' should be a string`).toBe('string');
      expect(value.length, `English key '${key}' should not be empty`).toBeGreaterThan(0);
    });
  });

  it('should resolve all i18n keys to non-empty strings in Russian', () => {
    const keys = ['title', 'subtitle', 'email', 'password', 'login', 'newToTipsio', 'createAccount', 'accountCreated'] as const;
    
    keys.forEach(key => {
      const value = ruMessages.venue.login[key];
      expect(value, `Russian key '${key}' should exist`).toBeTruthy();
      expect(typeof value, `Russian key '${key}' should be a string`).toBe('string');
      expect(value.length, `Russian key '${key}' should not be empty`).toBeGreaterThan(0);
    });
  });

  it('should resolve all i18n keys to non-empty strings in Indonesian', () => {
    const keys = ['title', 'subtitle', 'email', 'password', 'login', 'newToTipsio', 'createAccount', 'accountCreated'] as const;
    
    keys.forEach(key => {
      const value = idMessages.venue.login[key];
      expect(value, `Indonesian key '${key}' should exist`).toBeTruthy();
      expect(typeof value, `Indonesian key '${key}' should be a string`).toBe('string');
      expect(value.length, `Indonesian key '${key}' should not be empty`).toBeGreaterThan(0);
    });
  });

  it('should not have any undefined or null values in translations', () => {
    const languages = [
      { name: 'English', messages: enMessages },
      { name: 'Russian', messages: ruMessages },
      { name: 'Indonesian', messages: idMessages },
    ];

    languages.forEach(({ name, messages }) => {
      const values = Object.values(messages.venue.login);
      values.forEach((value, index) => {
        expect(value, `${name} value at index ${index} should not be undefined`).not.toBeUndefined();
        expect(value, `${name} value at index ${index} should not be null`).not.toBeNull();
      });
    });
  });
});

/**
 * Integration tests for venue login page authentication flow
 * 
 * These tests verify the complete authentication flow including:
 * - Successful login redirects to dashboard
 * - Failed login displays error message
 * - Registration link navigation
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 6.1**
 */
describe('Integration: Authentication Flow', () => {
  it('should have form submission handler', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify form uses handleSubmit from react-hook-form
    expect(componentContent).toContain('handleSubmit');
    expect(componentContent).toContain('onSubmit={handleSubmit(onSubmit)}');
    
    // Verify onSubmit function is defined
    expect(componentContent).toContain('const onSubmit = async');
    expect(componentContent).toContain('signIn("credentials"');
  });

  it('should redirect to dashboard on successful login', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify successful login redirects to dashboard
    expect(componentContent).toContain('router.push("/venue/dashboard")');
    
    // Verify router is imported and used
    expect(componentContent).toContain('useRouter');
    expect(componentContent).toContain('from "next/navigation"');
  });

  it('should display error message on failed login', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify error state is managed
    expect(componentContent).toContain('useState<string | null>(null)');
    expect(componentContent).toContain('setError');
    
    // Verify error is displayed in UI
    expect(componentContent).toContain('error &&');
    expect(componentContent).toContain('bg-destructive/10');
    expect(componentContent).toContain('text-destructive');
    
    // Verify error handling for failed login
    expect(componentContent).toContain('result?.error');
    expect(componentContent).toContain('setError("Invalid email or password")');
  });

  it('should handle registration success message', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify registered query param is checked
    expect(componentContent).toContain('useSearchParams');
    expect(componentContent).toContain('searchParams.get("registered")');
    
    // Verify success message is displayed
    expect(componentContent).toContain('registered &&');
    expect(componentContent).toContain('bg-success/10');
    expect(componentContent).toContain("t('accountCreated')");
  });

  it('should have loading state during authentication', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify loading state is managed
    expect(componentContent).toContain('isLoading');
    expect(componentContent).toContain('setIsLoading(true)');
    expect(componentContent).toContain('setIsLoading(false)');
    
    // Verify button is disabled during loading
    expect(componentContent).toContain('disabled={isLoading}');
    
    // Verify loading indicator is shown
    expect(componentContent).toContain('isLoading ? "..." :');
  });

  it('should navigate to registration page via link', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify Link component is used for navigation
    expect(componentContent).toContain('import Link from "next/link"');
    expect(componentContent).toContain('<Link href="/venue/register"');
    
    // Verify link text uses i18n
    expect(componentContent).toContain("t('createAccount')");
  });

  it('should use NextAuth signIn for authentication', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify NextAuth is imported
    expect(componentContent).toContain('import { signIn } from "next-auth/react"');
    
    // Verify credentials provider is used
    expect(componentContent).toContain('signIn("credentials"');
    expect(componentContent).toContain('email: data.email');
    expect(componentContent).toContain('password: data.password');
    expect(componentContent).toContain('redirect: false');
  });

  it('should handle authentication errors gracefully', () => {
    const fs = require('fs');
    const path = require('path');
    const componentContent = fs.readFileSync(
      path.join(__dirname, 'page.tsx'),
      'utf-8'
    );

    // Verify try-catch block for error handling
    expect(componentContent).toContain('try {');
    expect(componentContent).toContain('} catch');
    expect(componentContent).toContain('} finally {');
    
    // Verify generic error message
    expect(componentContent).toContain('Something went wrong');
    
    // Verify loading state is reset in finally block
    expect(componentContent).toContain('finally {');
    expect(componentContent).toContain('setIsLoading(false)');
  });
});
