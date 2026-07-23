// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: [
    './assets/css/main.css',
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vueuse/nuxt',
  ],

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    exposeConfig: true,
    injectPosition: 'first',
    viewer: true,
  },

  app: {
    head: {
      title: 'عن مصر',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'منصة إخبارية متخصصة في نشر أحدث الأخبار والمعلومات' },
        { name: 'theme-color', content: '#233D4D' },
        { property: 'og:locale', content: 'ar_AR' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'عن مصر' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
        },
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/rss.xml'],
    },
  },

  runtimeConfig: {
    apiSecret: process.env.API_SECRET,

    public: {
      apiBase: process.env.API_BASE || 'https://89.167.10.171.nip.io/api/', // ✅ أضفنا /
      siteName: 'عن مصر',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    },
  },

  build: {
    transpile: ['swiper'],
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  compatibilityDate: '2024-07-13',
})
