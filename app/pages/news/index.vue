<script setup lang="ts">
// ============================================================
// صفحة قائمة المقالات - Blog Posts List (SEO Optimized)
// ✅ SSR عبر useAsyncData
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical + Pagination)
// ============================================================

interface Tag {
  id: number
  name_ar: string
  slug: string
}

interface Category {
  id: number
  name_ar: string
  slug: string
  icon: string
  color: string
}

interface AuthorInfo {
  display_name_ar: string
}

interface BlogPost {
  id: number
  title_ar: string
  slug: string
  excerpt_ar: string
  content_ar: string
  featured_image: string | null
  category: Category | null
  tags: Tag[]
  author_info: AuthorInfo
  created_at: string
  views_count: number
  show_whatsapp_button: boolean
  show_telegram_button: boolean
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: BlogPost[]
}

// --- Config ---
const config   = useRuntimeConfig()
const API_BASE = config.public.apiBase as string
const SITE_URL = config.public.siteUrl as string

// --- Route / Pagination ---
const route       = useRoute()
const currentPage = computed(() => {
  const p = Number(route.query.page)
  return Number.isFinite(p) && p > 0 ? p : 1
})

// --- Helpers ---
const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  return url.startsWith('http') ? url : `${API_BASE.replace(/\/api\/?$/, '')}${url}`
}

// ✅ تنسيق التاريخ بتوقيت Africa/Cairo
const { formatDate } = useFormatDate()

const stripHtml = (html: string): string => {
  if (!html) return ''
  const clean = html.replace(/<[^>]*>/g, '').trim()
  return clean.length > 150 ? clean.substring(0, 150) + '...' : clean
}

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

// --- Fallback Data ---
const fallbackPosts: BlogPost[] = [
  {
    id: 446,
    title_ar: 'قصة قصيرة هادفة للاطفال عن الامانة',
    slug: 'a-purposeful-short-story-for-kids-about-honesty',
    excerpt_ar: 'قصة قصيرة هادفة للأطفال تعزز من قيمة الأمانة وأهمية الصدق في حياتهم اليومية.',
    content_ar: '',
    featured_image: 'https://89.167.10.171.nip.io/media/blog/posts/download.jpg',
    category: null,
    tags: [],
    author_info: { display_name_ar: 'عبدالله علاء السقا' },
    created_at: '2026-07-18T10:18:36.535195+02:00',
    views_count: 4,
    show_whatsapp_button: false,
    show_telegram_button: false,
  },
]

// --- SSR Data Fetch ---
const { data: pageData } = await useAsyncData(
  `blog-posts-page-${currentPage.value}`,
  async () => {
    try {
      const data = await fetchWithRetry<ApiResponse>(
        `${API_BASE}/blog/blog-posts/?page=${currentPage.value}`
      )
      return {
        posts: data.results,
        totalCount: data.count,
        hasNext: !!data.next,
        hasPrevious: !!data.previous,
        apiAvailable: true,
      }
    } catch {
      return {
        posts: fallbackPosts,
        totalCount: fallbackPosts.length,
        hasNext: false,
        hasPrevious: false,
        apiAvailable: false,
      }
    }
  },
  { watch: [currentPage] }
)

// --- Computed ---
const posts        = computed(() => pageData.value?.posts ?? [])
const totalCount   = computed(() => pageData.value?.totalCount ?? 0)
const hasNext      = computed(() => pageData.value?.hasNext ?? false)
const hasPrevious  = computed(() => pageData.value?.hasPrevious ?? false)
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- URLs ---
const canonicalUrl = computed(() =>
  currentPage.value > 1
    ? `${SITE_URL}/news?page=${currentPage.value}`
    : `${SITE_URL}/news`
)

const prevPageUrl = computed(() =>
  currentPage.value === 2
    ? `${SITE_URL}/news`
    : `${SITE_URL}/news?page=${currentPage.value - 1}`
)

const nextPageUrl = computed(() =>
  `${SITE_URL}/news?page=${currentPage.value + 1}`
)

// --- SEO ---
const pageTitle = computed(() =>
  currentPage.value > 1
    ? `آخر الأخبار - صفحة ${currentPage.value} | عن مصر`
    : 'آخر الأخبار | عن مصر'
)
const pageDesc = 'اطلع على أحدث الأخبار العاجلة، والتقارير السياسية والاقتصادية والرياضية والتكنولوجية من موقع عن مصر.'
const ogImage  = `${SITE_URL}/og-default.jpg`

useHead(() => {
  const linkTags: any[] = [{ rel: 'canonical', href: canonicalUrl.value }]
  if (hasPrevious.value) linkTags.push({ rel: 'prev', href: prevPageUrl.value })
  if (hasNext.value)     linkTags.push({ rel: 'next', href: nextPageUrl.value })

  return {
    title: pageTitle.value,
    htmlAttrs: { lang: 'ar', dir: 'rtl' },
    link: linkTags,
    meta: [
      { name: 'description', content: pageDesc },
      { name: 'robots',      content: 'index, follow' },

      // ✅ og:locale مُصحَّح من ar_AR إلى ar_EG
      { property: 'og:type',         content: 'website' },
      { property: 'og:title',        content: pageTitle.value },
      { property: 'og:description',  content: pageDesc },
      { property: 'og:url',          content: canonicalUrl.value },
      { property: 'og:locale',       content: 'ar_EG' },
      { property: 'og:image',        content: ogImage },        // ✅ مضاف
      { property: 'og:image:width',  content: '1200' },         // ✅ مضاف
      { property: 'og:image:height', content: '630' },          // ✅ مضاف
      { property: 'og:image:alt',    content: pageTitle.value }, // ✅ مضاف

      // ✅ Twitter - كانت ناقصة
      { name: 'twitter:card',        content: 'summary_large_image' },
      { name: 'twitter:title',       content: pageTitle.value },
      { name: 'twitter:description', content: pageDesc },
      { name: 'twitter:image',       content: ogImage },        // ✅ مضاف
      { name: 'twitter:image:alt',   content: pageTitle.value }, // ✅ مضاف
    ],
    script: [
      // ✅ BreadcrumbList - مضافة من الصفر
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'المقالات', item: `${SITE_URL}/news` },
          ],
        }),
      },
      // ✅ CollectionPage - محسّنة
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/news#collectionpage`, // ✅ مضاف
          url: canonicalUrl.value,
          name: pageTitle.value,
          description: pageDesc,
          inLanguage: 'ar-EG', // ✅ كان 'ar'
          isPartOf: {           // ✅ مضاف
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'عن مصر',
            url: SITE_URL,
          },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: posts.value.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${SITE_URL}/news/${post.slug}`,
              name: post.title_ar,
            })),
          },
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">

    <!-- API Warning Banner -->
    <div v-if="!apiAvailable" role="alert" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-7xl mx-auto px-4 py-3 text-center">
        <p class="text-amber-700 text-sm font-medium">⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي</p>
      </div>
    </div>

    <!-- Header Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- ✅ Breadcrumb - مضاف من الصفر -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-orange-600 transition-colors">الرئيسية</NuxtLink>
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="text-gray-900 font-medium">المقالات</span>
        </nav>

        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">المقالات</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            استكشف مجموعة متنوعة من الموضوعات المفيدة والمقالات المتخصصة
          </p>
          <div class="mt-4 text-sm text-gray-500">
            إجمالي المقالات:
            <span class="font-bold text-orange-600">{{ totalCount.toLocaleString('ar-SA') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Posts Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-label="قائمة المقالات">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Featured Image -->
          <div class="relative h-48 overflow-hidden bg-gray-100">
            <img
              v-if="getImageUrl(post.featured_image)"
              :src="getImageUrl(post.featured_image)!"
              :alt="post.title_ar"
              width="400"
              height="192"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" aria-hidden="true">
              <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div
              v-if="post.category"
              class="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full"
              :style="{ backgroundColor: post.category.color || '#f97316' }"
            >
              {{ post.category.name_ar }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <!-- Tags -->
            <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag.id"
                class="px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded-md border border-orange-100"
              >
                {{ tag.name_ar }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed">
              <NuxtLink :to="`/news/${post.slug}`" class="focus:outline-none focus:ring-2 focus:ring-orange-400 rounded" :aria-label="post.title_ar">
                {{ post.title_ar }}
              </NuxtLink>
            </h2>

            <!-- Excerpt -->
            <p class="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {{ stripHtml(post.excerpt_ar) }}
            </p>

            <!-- Meta -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{{ post.author_info.display_name_ar }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <!-- ✅ views_count بـ toLocaleString -->
                <span class="flex items-center gap-1" :aria-label="`${post.views_count} مشاهدة`">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ post.views_count.toLocaleString('ar-SA') }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDate(post.created_at) }}
                </span>
              </div>
            </div>

            <!-- Read More -->
            <div class="mt-4">
              <NuxtLink
                :to="`/news/${post.slug}`"
                class="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                قراءة المزيد
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="posts.length === 0" class="text-center py-16" role="status" aria-live="polite">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <p class="text-gray-500 text-lg">لا توجد مقالات متاحة حالياً</p>
      </div>

      <!-- Pagination -->
      <nav
        v-if="hasNext || hasPrevious"
        class="flex items-center justify-center gap-4 mt-12"
        aria-label="تصفح الصفحات"
      >
        <NuxtLink
          v-if="hasPrevious"
          :to="currentPage === 2 ? '/news' : `/news?page=${currentPage - 1}`"
          class="px-5 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          ← السابق
        </NuxtLink>
        <span class="text-gray-500 text-sm">صفحة {{ currentPage }}</span>
        <NuxtLink
          v-if="hasNext"
          :to="`/news?page=${currentPage + 1}`"
          class="px-5 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          التالي →
        </NuxtLink>
      </nav>

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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>