<script setup lang="ts">
// ============================================================
// صفحة كل الأقسام - Categories List (SEO Optimized)
// ✅ SSR عبر useAsyncData
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical)
// ============================================================

interface Category {
  id: number
  name_ar: string
  slug: string
  description_ar: string
  icon: string
  color: string
  image: string | null
  order: number
  is_active: boolean
  show_on_menu: boolean
  posts_count: number
}

interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// --- Config ---
const config   = useRuntimeConfig()
const API_BASE = config.public.apiBase as string
const SITE_URL = config.public.siteUrl as string

// --- Fallback Data ---
const fallbackCategories: Category[] = [
  {
    id: 6,
    name_ar: 'عن مصر',
    slug: 'عن-مصر',
    description_ar: 'أخبار عن مصر',
    icon: '',
    color: '#417690',
    image: null,
    order: 0,
    is_active: true,
    show_on_menu: true,
    posts_count: 1,
  },
]

// --- Fetch with Retry ---
const fetchWithRetry = async <T,>(url: string, retries = 2): Promise<T> => {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      return await $fetch<T>(url, {
        retry: 0,
        timeout: 10000,
        headers: { Accept: 'application/json' },
      })
    } catch (err) {
      lastError = err
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastError
}

// --- SSR Data Fetch ---
const { data: pageData } = await useAsyncData('categories-page', async () => {
  try {
    const data = await fetchWithRetry<ApiResponse<Category>>(
      `${API_BASE}/blog/blog-categories/`
    )
    const filtered = data.results.filter((c) => c.is_active && c.posts_count > 0)
    return {
      categories: filtered.length > 0 ? filtered : [],
      apiAvailable: true,
    }
  } catch {
    return {
      categories: fallbackCategories,
      apiAvailable: false,
    }
  }
})

// --- Computed ---
const categories   = computed(() => pageData.value?.categories ?? [])
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- SEO ---
const canonicalUrl = `${SITE_URL}/category`
const pageTitle    = 'الأقسام - عن مصر'
const pageDesc     = 'استعرض جميع أقسام الموقع والموضوعات المتاحة - سياسة، اقتصاد، ثقافة، ورياضة'
const ogImage      = `${SITE_URL}/og-default.jpg`

useHead(() => ({
  title: pageTitle,
  htmlAttrs: { lang: 'ar', dir: 'rtl' },
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [
    { name: 'description', content: pageDesc },
    { name: 'robots',      content: 'index, follow' },

    // ✅ og:locale مُصحَّح من ar_AR إلى ar_EG
    { property: 'og:type',         content: 'website' },
    { property: 'og:title',        content: pageTitle },
    { property: 'og:description',  content: pageDesc },
    { property: 'og:url',          content: canonicalUrl },
    { property: 'og:locale',       content: 'ar_EG' },
    { property: 'og:image',        content: ogImage },         // ✅ مضاف
    { property: 'og:image:width',  content: '1200' },          // ✅ مضاف
    { property: 'og:image:height', content: '630' },           // ✅ مضاف
    { property: 'og:image:alt',    content: pageTitle },       // ✅ مضاف

    // ✅ Twitter - كانت ناقصة
    { name: 'twitter:card',        content: 'summary_large_image' },
    { name: 'twitter:title',       content: pageTitle },
    { name: 'twitter:description', content: pageDesc },
    { name: 'twitter:image',       content: ogImage },         // ✅ مضاف
    { name: 'twitter:image:alt',   content: pageTitle },       // ✅ مضاف
  ],
  script: [
    // ✅ CollectionPage - محسّنة
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collectionpage`, // ✅ مضاف
        url: canonicalUrl,
        name: pageTitle,
        description: pageDesc,
        inLanguage: 'ar-EG',  // ✅ كان 'ar'
        isPartOf: {            // ✅ مضاف
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'عن مصر',
          url: SITE_URL,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: categories.value.map((cat, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/category/${cat.slug}`,
            name: cat.name_ar,
          })),
        },
      }),
    },
    // ✅ BreadcrumbList
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'الأقسام',  item: canonicalUrl },
        ],
      }),
    },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">

    <!-- API Warning Banner -->
    <div v-if="!apiAvailable" role="alert" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-7xl mx-auto px-4 py-3 text-center">
        <p class="text-amber-700 text-sm font-medium">⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي</p>
      </div>
    </div>

    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">

          <!-- ✅ Breadcrumb - متطابق مع JSON-LD -->
          <nav class="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <NuxtLink to="/" class="hover:text-orange-600 transition-colors">الرئيسية</NuxtLink>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-gray-700">الأقسام</span>
          </nav>

          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">الأقسام</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            استعرض جميع أقسام الموقع واكتشف الموضوعات المتنوعة
          </p>
          <!-- ✅ toLocaleString مضاف -->
          <div class="mt-4 text-sm text-gray-500">
            إجمالي الأقسام:
            <span class="font-bold text-orange-600">
              {{ categories.length.toLocaleString('ar-SA') }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="قائمة الأقسام">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          :aria-label="`تصفح قسم ${cat.name_ar}`"
        >
          <!-- Category Header with Color -->
          <div
            class="h-24 flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: cat.color || '#f97316' }"
          >
            <div class="absolute inset-0 opacity-10" aria-hidden="true">
              <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern :id="'grid-' + cat.id" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
                </pattern>
                <rect width="100" height="100" :fill="'url(#grid-' + cat.id + ')'"/>
              </svg>
            </div>
            <div class="relative w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
              {{ cat.name_ar }}
            </h2>
            <p v-if="cat.description_ar" class="text-sm text-gray-600 mb-4 line-clamp-2">
              {{ cat.description_ar }}
            </p>
            <div class="flex items-center justify-between">
              <!-- ✅ toLocaleString مضاف -->
              <span class="text-sm text-gray-500 flex items-center gap-1" :aria-label="`${cat.posts_count} مقال`">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ cat.posts_count.toLocaleString('ar-SA') }} مقال
              </span>
              <span class="text-orange-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                تصفح
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="text-center py-20" role="status" aria-live="polite">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <p class="text-gray-500 text-lg">لا توجد أقسام متاحة حالياً</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>