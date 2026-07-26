<script setup lang="ts">
// ============================================================
// صفحة من نحن - About Us (SEO Optimized)
// ✅ SSR عبر useAsyncData بدل onMounted
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical)
// ============================================================
import { marked } from 'marked'

interface PageSection {
  id: number
  title: string
  content: string
  order: number
}

interface PageData {
  id: number
  title: string
  slug: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  content: string
  sections: PageSection[] | Record<string, any>
  created_at: string
  updated_at: string
}

// --- Markdown renderer ---
marked.setOptions({ breaks: true })

// --- Config ---
const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string).replace(/\/api\/?$/, '')
const SITE_URL = config.public.siteUrl as string

// --- Fallback Data ---
const fallbackPage: PageData = {
  id: 1,
  title: 'من نحن',
  slug: 'about-us',
  meta_title: 'من نحن - عن مصر',
  meta_description: 'تعرف على منصة عن مصر ورسالتها ورؤيتها.',
  meta_keywords: 'عن مصر, من نحن, منصة إخبارية',
  content: `"عن مصر" منصة إخبارية متخصصة في نشر أحدث الأخبار والمعلومات المتعلقة بمصر والعالم العربي.`,
  sections: [
    { id: 1, title: 'رسالتنا', content: 'نسعى لتوفير معلومات دقيقة وحديثة تخدم القارئ العربي.', order: 1 },
    { id: 2, title: 'رؤيتنا',  content: 'أن نكون المصدر الأول الموثوق للأخبار المتعلقة بمصر.', order: 2 },
  ],
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

// ✅ SSR عبر useAsyncData بدل onMounted (Google تقدر تقرأ المحتوى)
const { data: pageData } = await useAsyncData('about-page', async () => {
  try {
    const data = await fetchWithRetry<PageData>(`${API_BASE}/api/pages/about-us/`)
    return { page: data, apiAvailable: true }
  } catch {
    return { page: fallbackPage, apiAvailable: false }
  }
})

const page        = computed(() => pageData.value?.page ?? null)
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- Markdown -> HTML ---
const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  return marked.parse(page.value.content) as string
})

const renderedSections = computed(() => {
  if (!page.value?.sections || !Array.isArray(page.value.sections)) return []
  return (page.value.sections as PageSection[])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      ...section,
      renderedContent: marked.parse(section.content || '') as string,
    }))
})

// --- SEO ---
const canonicalUrl = `${SITE_URL}/about`

useHead(() => {
  const p = page.value

  // قيم افتراضية لو الصفحة لسه ما اتحملتش
  const title       = p?.meta_title || p?.title || 'من نحن - عن مصر'
  const description = p?.meta_description || 'تعرف على منصة عن مصر ورسالتها ورؤيتها.'
  const keywords    = p?.meta_keywords || ''
  const ogImage     = `${SITE_URL}/og-default.jpg`

  return {
    htmlAttrs: { lang: 'ar', dir: 'rtl' }, // ✅ مضاف
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords',    content: keywords },
      { name: 'robots',      content: 'index, follow' }, // ✅ مضاف

      // ✅ Open Graph - كانت مفقودة كلياً
      { property: 'og:type',        content: 'website' },
      { property: 'og:title',       content: title },
      { property: 'og:description', content: description },
      { property: 'og:url',         content: canonicalUrl },
      { property: 'og:locale',      content: 'ar_EG' },
      { property: 'og:image',       content: ogImage },
      { property: 'og:image:width',  content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt',    content: title },

      // ✅ Twitter Card - كانت مفقودة كلياً
      { name: 'twitter:card',        content: 'summary_large_image' },
      { name: 'twitter:title',       content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image',       content: ogImage },
      { name: 'twitter:image:alt',   content: title },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }, // ✅ مضاف
    ],
    script: [
      // ✅ WebPage Schema - مضافة من الصفر
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: title,
          description: description,
          inLanguage: 'ar-EG',
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'عن مصر',
            url: SITE_URL,
          },
          publisher: {
            '@type': 'NewsMediaOrganization',
            '@id': `${SITE_URL}/#organization`,
            name: 'عن مصر',
          },
        }),
      },
      // ✅ BreadcrumbList - مضافة من الصفر
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: p?.title || 'من نحن', item: canonicalUrl },
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

        <!-- ✅ Breadcrumb - متطابق مع JSON-LD -->
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

        <!-- Main Content -->
        <div
          v-if="page.content"
          class="prose max-w-none space-y-6 text-body leading-relaxed"
          v-html="renderedContent"
        />

        <!-- Sections -->
        <div v-if="renderedSections.length > 0" class="mt-8 space-y-8">
          <div v-for="section in renderedSections" :key="section.id" class="prose max-w-none">
            <h2 class="text-xl font-bold text-primary-dark mt-8 mb-4">{{ section.title }}</h2>
            <div class="text-body leading-relaxed" v-html="section.renderedContent" />
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.prose :deep(h1) { @apply text-2xl font-bold text-primary-dark mt-6 mb-4; }
.prose :deep(h2) { @apply text-xl font-bold text-primary-dark mt-8 mb-4; }
.prose :deep(h3) { @apply text-lg font-bold text-primary-dark mt-6 mb-3; }
.prose :deep(p)  { @apply text-body leading-relaxed mb-4; }
.prose :deep(ul) { @apply list-disc list-inside space-y-2 mr-4 mb-4; }
.prose :deep(ol) { @apply list-decimal list-inside space-y-2 mr-4 mb-4; }
.prose :deep(li) { @apply text-body; }
.prose :deep(a)  { @apply text-primary-orange hover:underline; }
.prose :deep(strong) { @apply font-bold text-primary-dark; }
</style>