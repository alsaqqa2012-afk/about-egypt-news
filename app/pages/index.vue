<script setup lang="ts">
// ============================================================
// الصفحة الرئيسية - محسّنة بالكامل
// ✅ SSR عبر useAsyncData
// ✅ SEO كامل (OG + Twitter + JSON-LD موحّد بصيغة @graph + Canonical)
// ✅ سكيما NewsArticle بقت في صفحة الخبر الفردية بس (مش هنا) — قرار SEO
// ✅ أحدث 5 أخبار في الأعلى
// ✅ RTL صحيح + Accessibility + CLS Fix
// ============================================================

// --- Types ---
interface Tag {
  id: number
  name_ar: string
  slug: string
}

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

interface BlogPost {
  id: number
  title_ar: string
  slug: string
  excerpt_ar: string
  content_ar?: string
  featured_image: string | null
  category?: Category | null
  tags?: Tag[]
  author_name?: string
  author_slug?: string | null
  author_info?: { display_name_ar: string; slug?: string }
  published_at?: string | null
  created_at?: string
  views_count: number
  reading_time?: number
}

interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface Section {
  category: Category
  posts: BlogPost[]
  error: string | null
}

// --- Config ---
const config = useRuntimeConfig()
const API_BASE = config.public.apiBase || 'https://89.167.10.171.nip.io'
const SITE_URL = (config.public.siteUrl || 'https://about-egypt-news.vercel.app').replace(/\/$/, '')

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

const fallbackPosts: BlogPost[] = [
  {
    id: 446,
    title_ar: 'قصة قصيرة هادفة للاطفال عن الامانة',
    slug: 'a-purposeful-short-story-for-kids-about-honesty',
    excerpt_ar: 'قصة قصيرة هادفة للأطفال تعزز من قيمة الأمانة وأهمية الصدق في حياتهم اليومية.',
    featured_image: 'https://89.167.10.171.nip.io/media/blog/posts/download.jpg',
    author_name: 'عبدالله علاء السقا',
    published_at: '2026-07-18T10:18:36.535195+02:00',
    views_count: 4,
  },
]

// --- Helpers ---
const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

// ✅ تحديد نوع الصورة ديناميكياً لاستخدامه في og:image:type
const getImageMimeType = (url: string): string => {
  if (url.includes('.png')) return 'image/png'
  if (url.includes('.webp')) return 'image/webp'
  if (url.includes('.gif')) return 'image/gif'
  return 'image/jpeg'
}

// ⚠️ إصلاح: 'ar-SA' يستخدم افتراضياً التقويم الهجري (Umm al-Qura) في بعض المتصفحات/البيئات
// ما يخلي تواريخ الأخبار تظهر بالسنة الهجرية بدل الميلادية. نستخدم 'ar-EG' + calendar: 'gregory' صراحة.
const { formatDate } = useFormatDate()

const getPostDate = (post: BlogPost): string => {
  const date = post.published_at || post.created_at
  if (!date) return ''
  return formatDate(date)
}

const getAuthorName = (post: BlogPost): string => {
  return post.author_name || post.author_info?.display_name_ar || 'غير معروف'
}
// ℹ️ ملاحظة: دوال بناء NewsArticle (تاريخ ISO / رابط الكاتب) اتنقلت لصفحة
// الخبر الفردية (/news/[slug].vue) لأن ده مكانها الصحيح في السكيما، مش هنا

const stripHtml = (html: string, maxLength = 130): string => {
  if (!html) return ''
  const clean = html.replace(/<[^>]*>/g, '').trim()
  return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean
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

// --- SSR Data Fetch ---
const { data: pageData } = await useAsyncData('home-page', async () => {
  let apiAvailable = true
  let categories: Category[] = []
  let latestPosts: BlogPost[] = []
  const sections: Section[] = []

  // 1. Fetch Categories
  try {
    const catData = await fetchWithRetry<ApiResponse<Category>>(
      `${API_BASE}/blog/blog-categories/`
    )
    const filtered = catData.results.filter(c => c.show_on_menu && c.posts_count > 0)
    categories = filtered.length > 0 ? filtered : fallbackCategories
    apiAvailable = true
  } catch {
    apiAvailable = false
    categories = fallbackCategories
  }

  // 2. Fetch Latest Posts
  try {
    const latestData = await fetchWithRetry<BlogPost[] | ApiResponse<BlogPost>>(
      `${API_BASE}/blog/blog-posts/latest/`
    )
    const posts = Array.isArray(latestData)
      ? latestData
      : (latestData as ApiResponse<BlogPost>).results ?? []
    latestPosts = posts.slice(0, 5)
  } catch {
    latestPosts = fallbackPosts
  }

  // 3. Fetch Posts per Category
  await Promise.all(
    categories.map(async (cat) => {
      try {
        const postsData = apiAvailable
          ? await fetchWithRetry<ApiResponse<BlogPost>>(
              `${API_BASE}/blog/blog-categories/${encodeURIComponent(cat.slug)}/posts/`
            )
          : { results: fallbackPosts, count: 0, next: null, previous: null }

        sections.push({ category: cat, posts: postsData.results.slice(0, 6), error: null })
      } catch {
        sections.push({ category: cat, posts: fallbackPosts, error: null })
      }
    })
  )

  sections.sort((a, b) => a.category.order - b.category.order)

  return { categories, latestPosts, sections, apiAvailable }
})

// --- Computed ---
const sections = computed(() => pageData.value?.sections ?? [])
const latestPosts = computed(() => pageData.value?.latestPosts ?? [])
const apiAvailable = computed(() => pageData.value?.apiAvailable ?? true)

// --- SEO ---
const siteTitle = 'عن مصر - بوابتك للأخبار والخدمات'

// ✅ description ديناميكي: لو فيه أخبار، نبني ملخص من عناوين أحدث 3 أخبار بدل نص ثابت دايمًا
const siteDesc = computed(() => {
  const titles = latestPosts.value.slice(0, 3).map(p => p.title_ar).filter(Boolean)
  if (titles.length > 0) {
    return `أحدث الأخبار عن مصر: ${titles.join(' | ')}`.slice(0, 160)
  }
  return 'استكشف أحدث المقالات والأخبار المتنوعة عن مصر - سياسة، اقتصاد، ثقافة، ورياضة'
})

// ✅ صورة OG: أول خبر أو الافتراضية
const ogImage = computed(() =>
  latestPosts.value[0]?.featured_image
    ? getImageUrl(latestPosts.value[0].featured_image)
    : `${SITE_URL}/og-default.jpg`
)

// ✅ alt للصورة: عنوان أول خبر أو اسم الموقع
const ogImageAlt = computed(() => latestPosts.value[0]?.title_ar || 'عن مصر - بوابتك للأخبار')

// ============================================================
// ✅ بناء JSON-LD موحّد بصيغة @graph
// Organization ↔ WebSite ↔ CollectionPage (بدون NewsArticle - مكانها صفحة الخبر الفردية)
// كل الكيانات مربوطة ببعض عبر @id بدل سكريبتات منفصلة معزولة
// ============================================================
const jsonLd = computed(() => {
  const orgId = `${SITE_URL}/#organization`
  const websiteId = `${SITE_URL}/#website`
  const webpageId = `${SITE_URL}/#webpage`
  const logoId = `${SITE_URL}/#logo`

  const graph: Record<string, any>[] = [
    {
      '@type': 'NewsMediaOrganization',
      '@id': orgId,
      name: 'عن مصر',
      url: SITE_URL,
      description: 'منصة إخبارية مصرية تقدم أحدث الأخبار والتقارير والمعلومات والخدمات.',
      logo: {
        '@type': 'ImageObject',
        '@id': logoId,
        // ⚠️ ملاحظة مهمة: لازم يكون /logo.png موجود فعليًا وبأبعاد مربعة قريبة
        // (مثلاً 512×512) وإلا Google Rich Results Test هيرفض النسبة 600×60 القديمة
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        caption: 'عن مصر',
      },
      image: { '@id': logoId },
      // ⚠️ لو مفيش حسابات سوشيال ميديا فعلية، اترك المصفوفة فاضية أو احذف الحقل كليًا
      // بدل ما تحطها فيها روابط وهمية
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: SITE_URL,
      name: 'عن مصر',
      description: siteDesc.value,
      inLanguage: 'ar-EG',
      publisher: { '@id': orgId },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'CollectionPage',
      '@id': webpageId,
      url: SITE_URL,
      name: siteTitle,
      description: siteDesc.value,
      inLanguage: 'ar-EG',
      isPartOf: { '@id': websiteId },
      about: { '@id': orgId },
      publisher: { '@id': orgId },
      ...(ogImage.value ? { primaryImageOfPage: { '@type': 'ImageObject', url: ogImage.value } } : {}),
    },
  ]

  // ℹ️ ملاحظة SEO: بقرار من المختص، سكيما NewsArticle لكل خبر اتشالت من هنا
  // (الصفحة الرئيسية). كل مقال المفروض يكون له NewsArticle schema خاصة بيه
  // في صفحته الفردية (/news/[slug].vue) بدل تكرارها هنا - عشان السكيما تعبّر
  // عن المحتوى الأساسي لكل صفحة على حدة، وتفادي أي تكرار غير ضروري (thin/duplicate markup)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
})

useHead({
  title: siteTitle,
  htmlAttrs: { lang: 'ar', dir: 'rtl' },
  link: [{ rel: 'canonical', href: SITE_URL }],
  meta: [
    { name: 'description', content: siteDesc },
    { name: 'robots', content: 'index, follow' },

    // Open Graph - Basic
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: siteTitle },
    { property: 'og:description', content: siteDesc },
    { property: 'og:url', content: SITE_URL },
    { property: 'og:site_name', content: 'عن مصر' },
    { property: 'og:locale', content: 'ar_EG' },

    // ✅ Open Graph - Image كاملة مع أبعاد
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: computed(() => (ogImage.value ? getImageMimeType(ogImage.value) : 'image/jpeg')) },
    { property: 'og:image:alt', content: ogImageAlt },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: siteTitle },
    { name: 'twitter:description', content: siteDesc },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: ogImageAlt },
  ],
  script: [
    // ✅ سكريبت JSON-LD واحد موحّد بصيغة @graph بدل سكريبتين منفصلين
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(jsonLd.value)),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">

    <!-- ===== API Warning Banner ===== -->
    <div v-if="!apiAvailable" role="alert" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
        <svg class="w-4 h-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
        </svg>
        <p class="text-amber-700 text-sm font-medium">وضع العرض التجريبي — البيانات من المخزن المحلي</p>
      </div>
    </div>

    <!-- ===== Hero Section ===== -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">عن مصر</h1>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          بوابتك للأخبار والخدمات — استكشف أحدث المقالات والموضوعات المتنوعة
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

      <!-- ===== أحدث الأخبار ===== -->
      <section v-if="latestPosts.length > 0" aria-labelledby="latest-heading">
        <div class="flex items-center justify-between mb-7">
          <div class="flex items-center gap-3">
            <div class="w-1 h-8 rounded bg-red-500" aria-hidden="true" />
            <h2 id="latest-heading" class="text-2xl md:text-3xl font-bold text-gray-900">🔴 أحدث الأخبار</h2>
          </div>
          <NuxtLink to="/news" class="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1" aria-label="عرض كل الأخبار">
            عرض الكل
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- البطاقة الرئيسية -->
          <NuxtLink
            :to="`/news/${latestPosts[0].slug}`"
            class="lg:col-span-2 group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer block"
            :aria-label="latestPosts[0].title_ar"
          >
            <div class="relative h-72 md:h-[420px] bg-gray-200">
              <img
                v-if="getImageUrl(latestPosts[0].featured_image)"
                :src="getImageUrl(latestPosts[0].featured_image)!"
                :alt="latestPosts[0].title_ar"
                width="800"
                height="420"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="eager"
                fetchpriority="high"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center" aria-hidden="true">
                <svg class="w-20 h-20 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
              <div class="absolute bottom-0 right-0 left-0 p-6">
                <div v-if="latestPosts[0].category" class="mb-3">
                  <span class="text-xs font-bold px-3 py-1 rounded-full text-white" :style="{ backgroundColor: latestPosts[0].category.color || '#f97316' }">
                    {{ latestPosts[0].category.name_ar }}
                  </span>
                </div>
                <h3 class="text-white text-xl md:text-2xl font-bold leading-snug mb-3 group-hover:text-orange-300 transition-colors">
                  {{ latestPosts[0].title_ar }}
                </h3>
                <div class="flex flex-wrap items-center gap-3 text-white/70 text-xs">
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {{ getAuthorName(latestPosts[0]) }}
                  </span>
                  <span v-if="getPostDate(latestPosts[0])" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {{ getPostDate(latestPosts[0]) }}
                  </span>
                  <span class="flex items-center gap-1" :aria-label="`${latestPosts[0].views_count} مشاهدة`">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    {{ latestPosts[0].views_count.toLocaleString('ar-SA') }}
                  </span>
                  <span v-if="latestPosts[0].reading_time" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ latestPosts[0].reading_time }} دقيقة قراءة
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- 4 أخبار جانبية -->
          <div class="flex flex-col gap-3">
            <NuxtLink
              v-for="post in latestPosts.slice(1, 5)"
              :key="post.id"
              :to="`/news/${post.slug}`"
              class="group flex gap-3 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
              :aria-label="post.title_ar"
            >
              <div class="relative w-24 h-24 shrink-0 bg-gray-100">
                <img
                  v-if="getImageUrl(post.featured_image)"
                  :src="getImageUrl(post.featured_image)!"
                  :alt="post.title_ar"
                  width="96"
                  height="96"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" aria-hidden="true">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div class="flex flex-col justify-center py-3 pl-3 gap-1.5 flex-1 min-w-0">
                <span v-if="post.category" class="text-xs font-semibold truncate" :style="{ color: post.category.color || '#f97316' }">
                  {{ post.category.name_ar }}
                </span>
                <h3 class="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                  {{ post.title_ar }}
                </h3>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                  <span v-if="getPostDate(post)">{{ getPostDate(post) }}</span>
                  <span v-if="post.reading_time">· {{ post.reading_time }} د</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <hr v-if="sections.filter(s => s.posts.length > 0).length > 0" class="border-gray-200" />

      <!-- ===== Dynamic Category Sections ===== -->
      <section
        v-for="section in sections.filter(s => s.posts.length > 0)"
        :key="section.category.id"
        :aria-labelledby="`cat-heading-${section.category.id}`"
      >
        <div class="flex items-center justify-between mb-7">
          <div class="flex items-center gap-3">
            <div class="w-1 h-8 rounded" :style="{ backgroundColor: section.category.color || '#f97316' }" aria-hidden="true" />
            <h2 :id="`cat-heading-${section.category.id}`" class="text-2xl md:text-3xl font-bold text-gray-900">
              {{ section.category.name_ar }}
            </h2>
            <span class="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium" :aria-label="`${section.category.posts_count} مقال`">
              {{ section.category.posts_count }}
            </span>
          </div>
          <NuxtLink
            :to="`/category/${section.category.slug}`"
            class="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
            :aria-label="`عرض كل مقالات ${section.category.name_ar}`"
          >
            عرض الكل
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="post in section.posts"
            :key="post.id"
            class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
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
                <svg class="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div v-if="post.category" class="absolute top-3 right-3">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm" :style="{ backgroundColor: post.category.color || '#f97316' }">
                  {{ post.category.name_ar }}
                </span>
              </div>
            </div>

            <div class="p-5">
              <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag.id"
                  class="px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded-md border border-orange-100 font-medium"
                >
                  #{{ tag.name_ar }}
                </span>
              </div>

              <h3 class="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed">
                <NuxtLink :to="`/news/${post.slug}`" class="focus:outline-none focus:ring-2 focus:ring-orange-400 rounded" :aria-label="post.title_ar">
                  {{ post.title_ar }}
                </NuxtLink>
              </h3>

              <p class="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                {{ stripHtml(post.excerpt_ar ?? '') }}
              </p>

              <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                <div class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>{{ getAuthorName(post) }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1" :aria-label="`${post.views_count} مشاهدة`">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    {{ post.views_count.toLocaleString('ar-SA') }}
                  </span>
                  <span v-if="getPostDate(post)" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {{ getPostDate(post) }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ===== No Content Fallback ===== -->
      <div v-if="sections.length === 0 && latestPosts.length === 0" class="text-center py-24" role="status" aria-live="polite">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <p class="text-gray-400 text-lg">لا توجد أخبار متاحة حالياً</p>
      </div>

    </div>
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