<script setup lang="ts">
// ============================================================
// صفحة ملف الكاتب - Author Profile Page (SEO Optimized)
// ============================================================

interface Tag {
  id: number
  name_ar: string
  slug: string
}

interface AuthorInfo {
  id?: number
  username?: string
  email?: string
  display_name_ar: string
  slug?: string
  bio_ar?: string
  title_ar?: string
  avatar?: string
  twitter_url?: string
  linkedin_url?: string
  posts_count?: number
}

interface PostListItem {
  id: number
  title_ar: string
  slug: string
  excerpt_ar: string
  featured_image: string | null
  tags: Tag[]
  author_info: AuthorInfo
  created_at: string
  views_count: number
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: PostListItem[]
}

// --- Route ---
const route = useRoute()
const authorSlug = route.params.slug as string

// --- Config ---
const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string).replace(/\/api\/?$/, '')
const SITE_URL = config.public.siteUrl as string

// --- State ---
const loading = ref(true)
const error = ref<string | null>(null)
const authorProfile = ref<AuthorInfo | null>(null)
const authorPosts = ref<PostListItem[]>([])
const visibleCount = ref(10)

// --- Helper ---
const absoluteUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

// ✅ تنسيق التاريخ بتوقيت Africa/Cairo (+02:00)
const { formatDate } = useFormatDate()

// ✅ تحويل أي تاريخ إلى ISO مع timezone القاهرة (+02:00)
const toISOCairo = (dateString: string): string => {
  const date = new Date(dateString)
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'Africa/Cairo',
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+02:00`
}

const stripHtml = (html: string): string =>
  !html ? '' : html.replace(/<[^>]*>/g, '').substring(0, 120)

// --- Fetch ---
const fetchAuthorData = async () => {
  loading.value = true
  error.value = null

  try {
    const authorRes = await $fetch<AuthorInfo>(
      `${API_BASE}/api/blog/blog-authors/${encodeURIComponent(authorSlug)}/`
    )
    authorProfile.value = authorRes

    const allPosts: PostListItem[] = []
    let nextUrl: string | null =
      `${API_BASE}/api/blog/blog-authors/${encodeURIComponent(authorSlug)}/posts/`
    let page = 0
    const MAX_PAGES = 15

    while (nextUrl && page < MAX_PAGES) {
      const res = await $fetch<PaginatedResponse | PostListItem[]>(nextUrl)
      if (Array.isArray(res)) {
        allPosts.push(...res)
        nextUrl = null
      } else {
        allPosts.push(...(res.results || []))
        nextUrl = res.next
      }
      page++
    }

    allPosts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    authorPosts.value = allPosts
  } catch (e: any) {
    error.value =
      e?.response?.status === 404 || e?.statusCode === 404
        ? 'لم يتم العثور على هذا الكاتب'
        : 'حدث خطأ أثناء جلب بيانات الكاتب'
  } finally {
    loading.value = false
  }
}

await fetchAuthorData()

// --- إحصائيات ---
const totalViews = computed(() =>
  authorPosts.value.reduce((sum, p) => sum + (p.views_count || 0), 0)
)
const displayedPosts = computed(() => authorPosts.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < authorPosts.value.length)
const loadMore = () => { visibleCount.value += 10 }

// --- SEO ---
const canonicalUrl = computed(() => `${SITE_URL}/author/${authorSlug}`)

useHead(() => {
  if (!authorProfile.value) return {}
  const a = authorProfile.value
  const description = a.bio_ar
    || `تصفح جميع مقالات ${a.display_name_ar}${a.title_ar ? ' - ' + a.title_ar : ''}`
  const image = absoluteUrl(a.avatar) || `${SITE_URL}/default-avatar.jpg`
  const pageTitle = `${a.display_name_ar} - جميع المقالات`

  return {
    htmlAttrs: { lang: 'ar', dir: 'rtl' },
    title: pageTitle,
    meta: [
      { name: 'description', content: description },
      { name: 'robots',      content: 'index, follow' },

      // Open Graph - Basic
      { property: 'og:type',        content: 'profile' },
      { property: 'og:title',       content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url',         content: canonicalUrl.value },
      { property: 'og:locale',      content: 'ar_EG' }, // ✅ مضاف

      // ✅ Open Graph - Image كاملة
      // صورة الكاتب عادةً مربعة (400×400) وليست 1200×630
      // لذلك نستخدم twitter:card = summary (مربع) وليس summary_large_image
      { property: 'og:image',        content: image },
      { property: 'og:image:width',  content: '400' },
      { property: 'og:image:height', content: '400' },
      { property: 'og:image:alt',    content: a.display_name_ar },

      // Twitter Card
      // ✅ summary (مربع) أنسب لصورة الكاتب من summary_large_image
      { name: 'twitter:card',        content: 'summary' },
      { name: 'twitter:title',       content: pageTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image',       content: image },
      { name: 'twitter:image:alt',   content: a.display_name_ar }, // ✅ مضاف
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
    script: [
      // ✅ ProfilePage + Person Schema - محسّنة
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': `${canonicalUrl.value}#profilepage`,
          url: canonicalUrl.value,
          name: pageTitle,
          description: description,
          inLanguage: 'ar-EG',
          // ✅ عدد المقالات في الصفحة
          numberOfItems: authorPosts.value.length,
          mainEntity: {
            '@type': 'Person',
            '@id': `${canonicalUrl.value}#person`,
            name: a.display_name_ar,
            url: canonicalUrl.value,
            description: a.bio_ar || undefined,
            jobTitle: a.title_ar || undefined,
            // ✅ حذف صورة الكاتب من Schema (غير ضرورية - متسق مع قرار صفحة المقال)
            sameAs: [a.twitter_url, a.linkedin_url].filter(Boolean),
          },
        }),
      },
      // ✅ BreadcrumbList - مُصحَّح: الرئيسية ← الكتّاب ← اسم الكاتب
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'الكتّاب',  item: `${SITE_URL}/authors` },
            { '@type': 'ListItem', position: 3, name: a.display_name_ar, item: canonicalUrl.value },
          ],
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">

    <!-- Loading -->
    <div v-if="loading" class="max-w-3xl mx-auto px-4 py-10">
      <div class="animate-pulse space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-white"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-white rounded w-40"></div>
            <div class="h-3 bg-white rounded w-24"></div>
          </div>
        </div>
        <div class="space-y-3 pt-4">
          <div v-for="i in 4" :key="i" class="h-20 bg-white rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error || !authorProfile" class="max-w-md mx-auto px-4 py-24 text-center">
      <p class="text-muted text-sm mb-4">{{ error }}</p>
      <NuxtLink
        to="/news"
        class="text-sm font-medium text-primary-dark border-b border-primary-dark pb-0.5 hover:text-primary-orange hover:border-primary-orange transition-colors"
      >
        العودة إلى المقالات
      </NuxtLink>
    </div>

    <!-- Profile -->
    <template v-else>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <!-- ============ Breadcrumb ============ -->
        <!-- ✅ متطابق مع JSON-LD: الرئيسية ← الكتّاب ← اسم الكاتب -->
        <nav class="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap" aria-label="Breadcrumb">
          <NuxtLink to="/" class="hover:text-primary-orange transition-colors">الرئيسية</NuxtLink>
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <NuxtLink to="/authors" class="hover:text-primary-orange transition-colors">الكتّاب</NuxtLink>
          <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="text-body truncate max-w-[200px]">{{ authorProfile.display_name_ar }}</span>
        </nav>

        <!-- ============ Header ============ -->
        <header class="bg-surface rounded-2xl shadow-soft p-6 mb-6">
          <div class="flex items-start gap-4">
            <img
              v-if="authorProfile.avatar"
              :src="absoluteUrl(authorProfile.avatar)"
              :alt="authorProfile.display_name_ar"
              width="64"
              height="64"
              style="width:64px;height:64px;min-width:64px;border-radius:9999px;object-fit:cover;"
              class="rounded-full object-cover shrink-0"
            />
            <div
              v-else
              style="width:64px;height:64px;min-width:64px;border-radius:9999px;display:flex;align-items:center;justify-content:center;"
              class="bg-light-bg text-primary-orange text-xl font-bold shrink-0"
            >
              {{ authorProfile.display_name_ar.charAt(0) }}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 class="font-display text-xl text-primary-dark">{{ authorProfile.display_name_ar }}</h1>
                <span v-if="authorProfile.title_ar" class="text-sm text-muted">· {{ authorProfile.title_ar }}</span>
              </div>

              <p v-if="authorProfile.bio_ar" class="mt-1.5 text-sm text-body leading-relaxed max-w-xl">
                {{ authorProfile.bio_ar }}
              </p>

              <!-- إحصائيات + روابط تواصل -->
              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                <span><strong class="text-primary-dark font-semibold">{{ authorPosts.length }}</strong> مقال</span>
                <span><strong class="text-primary-dark font-semibold">{{ totalViews.toLocaleString('ar') }}</strong> مشاهدة</span>
                <a v-if="authorProfile.twitter_url"  :href="authorProfile.twitter_url"  target="_blank" rel="noopener noreferrer" class="text-muted hover:text-primary-orange transition-colors">تويتر</a>
                <a v-if="authorProfile.linkedin_url" :href="authorProfile.linkedin_url" target="_blank" rel="noopener noreferrer" class="text-muted hover:text-primary-orange transition-colors">لينكدإن</a>
                <a v-if="authorProfile.email"        :href="`mailto:${authorProfile.email}`"              class="text-muted hover:text-primary-orange transition-colors">راسله</a>
              </div>
            </div>
          </div>
        </header>

        <!-- ============ Posts List ============ -->
        <section class="bg-surface rounded-2xl shadow-soft px-6" aria-label="مقالات الكاتب">
          <div v-if="authorPosts.length === 0" class="py-16 text-center text-sm text-muted">
            لا توجد مقالات منشورة لهذا الكاتب حتى الآن.
          </div>

          <ul v-else class="divide-y divide-light-bg">
            <li v-for="post in displayedPosts" :key="post.id">
              <NuxtLink :to="`/news/${post.slug}`" class="group flex items-center gap-4 py-4">
                <div
                  style="width:64px;height:64px;min-width:64px;border-radius:8px;overflow:hidden;"
                  class="bg-light-bg shrink-0"
                >
                  <img
                    v-if="post.featured_image"
                    :src="absoluteUrl(post.featured_image)"
                    :alt="post.title_ar"
                    loading="lazy"
                    width="64"
                    height="64"
                    style="width:64px;height:64px;object-fit:cover;display:block;"
                  />
                  <div v-else style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;" class="text-muted">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <h2 class="font-display text-sm text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-1">
                    {{ post.title_ar }}
                  </h2>
                  <p class="mt-0.5 text-xs text-muted line-clamp-1">
                    {{ stripHtml(post.excerpt_ar) }}
                  </p>
                  <div class="mt-1.5 flex items-center gap-3 text-xs text-muted">
                    <!-- ✅ datetime بتوقيت القاهرة +02:00 -->
                    <time :datetime="toISOCairo(post.created_at)">{{ formatDate(post.created_at) }}</time>
                    <span>{{ post.views_count.toLocaleString('ar-SA') }} مشاهدة</span>
                  </div>
                </div>

                <svg class="w-4 h-4 text-muted group-hover:text-primary-orange transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                </svg>
              </NuxtLink>
            </li>
          </ul>

          <div v-if="hasMore" class="py-4 text-center">
            <button @click="loadMore" class="text-sm font-medium text-muted hover:text-primary-orange transition-colors">
              عرض المزيد ↓
            </button>
          </div>
        </section>

      </div>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>