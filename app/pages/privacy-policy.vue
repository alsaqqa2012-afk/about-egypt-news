<script setup lang="ts">
// ============================================================
// صفحة سياسة الخصوصية - Privacy Policy (SEO Optimized)
// ✅ SSR عبر useAsyncData بدل onMounted
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical)
// ============================================================
import { marked } from 'marked'

interface PageData {
  id: number
  title: string
  slug: string
  content: string
  meta_description: string
  meta_keywords: string
  banner_image_url: string | null
  thumbnail_image_url: string | null
  is_published: boolean
  show_in_menu: boolean
  menu_order: number
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
  id: 6,
  title: 'سياسة الخصوصية',
  slug: 'privacy-policy',
  content: `مرحبًا بكم في موقع **عن مصر**. نحن نولي أهمية كبيرة لخصوصية زوارنا، ونلتزم بحماية المعلومات التي يتم جمعها واستخدامها وفقًا لأفضل الممارسات والمعايير المتبعة.`,
  meta_description: 'سياسة الخصوصية لموقع عن مصر توضح كيفية جمع واستخدام وحماية بيانات الزوار، وملفات تعريف الارتباط، والإعلانات، وحقوق المستخدمين.',
  meta_keywords: 'سياسة الخصوصية, عن مصر, حماية البيانات, cookies',
  banner_image_url: null,
  thumbnail_image_url: null,
  is_published: true,
  show_in_menu: false,
  menu_order: 0,
  created_at: '2026-07-21T11:14:22.560004+02:00',
  updated_at: '2026-07-21T11:14:22.560027+02:00',
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

// ✅ SSR عبر useAsyncData بدل onMounted
const { data: pageData } = await useAsyncData('privacy-page', async () => {
  try {
    const data = await fetchWithRetry<PageData>(`${API_BASE}/api/pages/privacy-policy/`)
    return { page: data, apiAvailable: true }
  } catch {
    return { page: fallbackPage, apiAvailable: false }
  }
})

const page         = computed(() => pageData.value?.page ?? null)
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- Markdown -> HTML ---
const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  return marked.parse(page.value.content) as string
})

// --- SEO ---
const canonicalUrl = `${SITE_URL}/privacy-policy`

useHead(() => {
  const p           = page.value
  const title       = p ? `${p.title} - عن مصر` : 'سياسة الخصوصية - عن مصر'
  const description = p?.meta_description || 'اطلع على سياسة الخصوصية الخاصة بموقع عن مصر.'
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
      { property: 'og:type',         content: 'website' },
      { property: 'og:title',        content: title },
      { property: 'og:description',  content: description },
      { property: 'og:url',          content: canonicalUrl },
      { property: 'og:locale',       content: 'ar_EG' },
      { property: 'og:image',        content: ogImage },
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
          '@type': 'WebPage',
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
            { '@type': 'ListItem', position: 1, name: 'الرئيسية',        item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: p?.title || 'سياسة الخصوصية', item: canonicalUrl },
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

      </div>
    </template>
  </div>
</template>

<style scoped>
.prose :deep(h1)     { @apply text-2xl font-bold text-primary-dark mt-6 mb-4; }
.prose :deep(h2)     { @apply text-xl font-bold text-primary-dark mt-8 mb-4; }
.prose :deep(h3)     { @apply text-lg font-bold text-primary-dark mt-6 mb-3; }
.prose :deep(p)      { @apply text-body leading-relaxed mb-4; }
.prose :deep(ul)     { @apply list-disc list-inside space-y-2 mr-4 mb-4; }
.prose :deep(ol)     { @apply list-decimal list-inside space-y-2 mr-4 mb-4; }
.prose :deep(li)     { @apply text-body; }
.prose :deep(a)      { @apply text-primary-orange hover:underline; }
.prose :deep(strong) { @apply font-bold text-primary-dark; }
</style>