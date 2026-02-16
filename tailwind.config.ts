import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", ...fontFamily.sans],
  			heading: ["var(--font-urbanist)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", ...fontFamily.sans],
  		},
  		colors: {
  			// Neutral scale
  			neutral: {
  				50: 'hsl(var(--neutral-50))',
  				100: 'hsl(var(--neutral-100))',
  				200: 'hsl(var(--neutral-200))',
  				300: 'hsl(var(--neutral-300))',
  				400: 'hsl(var(--neutral-400))',
  				500: 'hsl(var(--neutral-500))',
  				600: 'hsl(var(--neutral-600))',
  				700: 'hsl(var(--neutral-700))',
  				800: 'hsl(var(--neutral-800))',
  				900: 'hsl(var(--neutral-900))',
  				950: 'hsl(var(--neutral-950))',
  			},
  			// Accent scale (teal)
  			teal: {
  				50: 'hsl(var(--accent-50))',
  				100: 'hsl(var(--accent-100))',
  				200: 'hsl(var(--accent-200))',
  				300: 'hsl(var(--accent-300))',
  				400: 'hsl(var(--accent-400))',
  				500: 'hsl(var(--accent-500))',
  				600: 'hsl(var(--accent-600))',
  				700: 'hsl(var(--accent-700))',
  				800: 'hsl(var(--accent-800))',
  				900: 'hsl(var(--accent-900))',
  			},
  			// Semantic colors
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			error: 'hsl(var(--error))',
  			info: 'hsl(var(--info))',
  			// Surface colors
  			surface: 'hsl(var(--surface))',
  			'surface-elevated': 'hsl(var(--surface-elevated))',
  			// Legacy compatibility
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			'border-strong': 'hsl(var(--border-strong))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				hover: 'hsl(var(--brand-hover))',
  				active: 'hsl(var(--brand-active))',
  				foreground: 'hsl(var(--brand-foreground))'
  			}
  		},
  		borderRadius: {
  			sm: 'var(--radius-sm)',
  			DEFAULT: 'var(--radius)',
  			lg: 'var(--radius-lg)',
  			// Legacy compatibility
  			md: 'calc(var(--radius) - 2px)',
  		},
  		spacing: {
  			// Design system spacing scale (4px base)
  			'1': '4px',
  			'2': '8px',
  			'3': '12px',
  			'4': '16px',
  			'5': '20px',
  			'6': '24px',
  			'8': '32px',
  			'10': '40px',
  			'12': '48px',
  			'16': '64px',
  		},
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
