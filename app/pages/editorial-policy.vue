<script setup lang="ts">
// ============================================================
// صفحة سياسة النشر - Editorial Policy (SEO Optimized)
// ✅ SSR عبر useAsyncData
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical)
// ✅ Markdown renderer
// ============================================================
import { marked } from 'marked'

interface PageData {
  id: number
  title: string
  slug: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  content: string
  sections: Record<string, any>
  created_at?: string
  updated_at?: string
}

// --- Markdown renderer ---
marked.setOptions({ breaks: true })

// --- Config ---
const config   = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string).replace(/\/api\/?$/, '')
const SITE_URL = config.public.siteUrl as string

// --- Fallback Data ---
const fallbackPage: PageData = {
  id: 7,
  title: 'سياسة النشر',
  slug: 'editorial-policy',
  meta_title: 'سياسة النشر - عن مصر',
  meta_description: 'اطلع على سياسة النشر في موقع عن مصر، والتي توضح معايير النشر والمحتوى.',
  meta_keywords: 'سياسة النشر, عن مصر, معايير النشر',
  content: `يرحب موقع **عن مصر** بجميع زواره، ويلتزم بتقديم محتوى إخباري موثوق، دقيق، وهادف، وفق أعلى المعايير المهنية والأخلاقية في العمل الصحفي.`,
  sections: {},
  created_at: '2026-01-01T00:00:00+02:00',
  updated_at: '2026-01-01T00:00:00+02:00',
}

// --- Fetch with Retry ---
const fetchWithRetry = async <T,>(url: string, retries = 2): Promise<T> => {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      return await $fetch<T>(url, { retry: 0, timeout: 10000 })
    } catch (err) {
      lastError = err
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastError
}

// ✅ SSR عبر useAsyncData
const { data: pageData } = await useAsyncData('editorial-policy-page', async () => {
  try {
    const data = await fetchWithRetry<PageData>(`${API_BASE}/api/pages/editorial-policy/`)
    return { page: data, apiAvailable: true }
  } catch {
    return { page: fallbackPage, apiAvailable: false }
  }
})

const page         = computed(() => pageData.value?.page ?? null)
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- Markdown -> HTML ---
// المحتوى الرئيسي يحتوي على كل الأقسام كـ Markdown مباشرة
const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  return marked.parse(page.value.content) as string
})

// --- SEO ---
const canonicalUrl = `${SITE_URL}/editorial-policy`

useHead(() => {
  const p = page.value

  const title       = p?.meta_title || p?.title || 'سياسة النشر - عن مصر'
  const description = p?.meta_description || 'اطلع على سياسة النشر في موقع عن مصر، والتي توضح معايير النشر والمحتوى.'
  const keywords    = p?.meta_keywords || ''
  const ogImage     = `${SITE_URL}/og-default.jpg`

  return {
    htmlAttrs: { lang: 'ar', dir: 'rtl' },
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords',    content: keywords },
      { name: 'robots',      content: 'index, follow' },

      // Open Graph
      { property: 'og:type',         content: 'website' },
      { property: 'og:title',        content: title },
      { property: 'og:description',  content: description },
      { property: 'og:url',          content: canonicalUrl },
      { property: 'og:locale',       content: 'ar_EG' },
      { property: 'og:image',        content: ogImage },
      { property: 'og:image:width',  content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt',    content: title },

      // Twitter Card
      { name: 'twitter:card',        content: 'summary_large_image' },
      { name: 'twitter:title',       content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image',       content: ogImage },
      { name: 'twitter:image:alt',   content: title },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    script: [
      // WebPage Schema
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type':    'WebPage',
          '@id':      `${canonicalUrl}#webpage`,
          url:         canonicalUrl,
          name:        title,
          description: description,
          inLanguage:  'ar-EG',
          isPartOf: {
            '@type': 'WebSite',
            '@id':   `${SITE_URL}/#website`,
            name:    'عن مصر',
            url:      SITE_URL,
          },
          publisher: {
            '@type': 'NewsMediaOrganization',
            '@id':   `${SITE_URL}/#organization`,
            name:    'عن مصر',
          },
        }),
      },
      // BreadcrumbList
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type':    'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية',   item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: p?.title || 'سياسة النشر', item: canonicalUrl },
          ],
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">

    <!-- API Status Warning -->
    <div v-if="!apiAvailable" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-4xl mx-auto px-4 py-3 text-center">
        <p class="text-amber-700 text-sm">⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!page" class="max-w-4xl mx-auto px-4 py-12">
      <div class="animate-pulse space-y-6">
        <div class="h-10 bg-gray-200 rounded w-1/3"></div>
        <div class="h-6 bg-gray-200 rounded w-full"></div>
        <div class="h-6 bg-gray-200 rounded w-5/6"></div>
        <div class="h-8 bg-gray-200 rounded w-1/4 mt-8"></div>
        <div class="h-6 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="max-w-4xl mx-auto px-4 py-12">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-muted mb-6" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-primary-orange transition-colors">الرئيسية</NuxtLink>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="text-body">{{ page.title }}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center gap-2 mb-8">
          <div class="w-1 h-8 bg-primary-orange rounded" aria-hidden="true" />
          <h1 class="text-2xl md:text-3xl font-bold text-primary-dark">{{ page.title }}</h1>
        </div>

        <!-- Main Content (Markdown يحتوي على كل الأقسام) -->
        <div
          v-if="renderedContent"
          class="prose max-w-none text-body leading-relaxed"
          v-html="renderedContent"
        />

      </div>
    </template>
  </div>
</template>

<style scoped>
.prose :deep(h1)     { @apply text-2xl font-bold text-primary-dark mt-6 mb-4; }
.prose :deep(h2)     { @apply text-xl font-bold text-primary-dark mt-8 mb-4 pb-2 border-b border-gray-100; }
.prose :deep(h3)     { @apply text-lg font-bold text-primary-dark mt-6 mb-3; }
.prose :deep(p)      { @apply text-body leading-relaxed mb-4; }
.prose :deep(ul)     { @apply list-disc list-inside space-y-2 mr-4 mb-4; }
.prose :deep(ol)     { @apply list-decimal list-inside space-y-2 mr-4 mb-4; }
.prose :deep(li)     { @apply text-body; }
.prose :deep(a)      { @apply text-primary-orange hover:underline; }
.prose :deep(strong) { @apply font-bold text-primary-dark; }
</style>