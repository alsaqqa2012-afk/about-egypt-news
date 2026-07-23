import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#EA580C',
          'orange-dark': '#9a3412',
          dark: '#0F172A',
        },
        'light-bg': '#F8FAFC',
        surface: '#FFFFFF',
        muted: '#64748B',
        body: '#1E293B',
        // توحيد درجات الرمادي مع باقي الألوان
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        display: ['Thmanyah Serif Display', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px rgba(15, 23, 42, .08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
