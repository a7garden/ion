/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mobile': '640px',
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
    extend: {
      colors: {
        border: "var(--border-default)",
        input: "var(--border-default)",
        ring: "var(--border-focus)",
        background: "var(--surface-default)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--text-primary)",
          foreground: "var(--surface-default)",
        },
        secondary: {
          DEFAULT: "var(--interactive-bg)",
          foreground: "var(--interactive-text)",
        },
        destructive: {
          DEFAULT: "var(--state-error)",
          foreground: "var(--text-inverse)",
        },
        muted: {
          DEFAULT: "var(--surface-muted)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--interactive-primary)",
          foreground: "var(--text-inverse)",
        },
        card: {
          DEFAULT: "var(--surface-subtle)",
          foreground: "var(--text-primary)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm, 6px)",
      },
      fontFamily: {
        display: ['Hahmlet', 'Georgia', 'serif'],
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'cool': '0 4px 20px var(--cool-shadow, oklch(0.4993 0.0987 250.4 / 0.08))',
        'cool-lg': '0 8px 32px var(--cool-shadow, oklch(0.4993 0.0987 250.4 / 0.12))',
        'blue-glow': '0 0 20px var(--blue-glow, oklch(0.5903 0.1492 252.0 / 0.15)), 0 0 40px var(--blue-glow, oklch(0.5903 0.1492 252.0 / 0.08))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
