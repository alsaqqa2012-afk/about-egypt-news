<script setup lang="ts">
// ============================================================
// صفحة تفاصيل المقال - Blog Post Detail (SEO Optimized)
// المسار الديناميكي: /news/[slug]
// API: يُقرأ من runtimeConfig (env vars) بدل الـ hardcoding
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
  is_active?: boolean
  show_in_authors_page?: boolean
  posts_count?: number
}

interface Comment {
  id: number
  author_name: string
  content: string
  created_at: string
}

interface RelatedPost {
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

interface BlogPost {
  id: number
  title_ar: string
  slug: string
  excerpt_ar: string
  content_ar: string
  featured_image: string | null
  featured_image_alt: string
  category: Category | null
  tags: Tag[]
  author_info: AuthorInfo
  status: string
  status_display: string
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  reading_time: number
  meta_title_ar: string
  meta_description_ar: string
  meta_keywords: string
  og_image: string | null
  views_count: number
  likes_count: number
  shares_count: number
  allow_comments: boolean
  show_whatsapp_button: boolean
  show_telegram_button: boolean
  whatsapp_url: string | null
  telegram_url: string | null
  comments: Comment[]
  comments_count: number
  related_posts: RelatedPost[]
  next_post: RelatedPost | null
  previous_post: RelatedPost | null
  created_at: string
  updated_at: string
}

// --- Route ---
const route = useRoute()
const slug = route.params.slug as string

// --- State ---
const post = ref<BlogPost | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const liked = ref(false)

// --- Config ---
// ملاحظة: apiBase في nuxt.config.ts مسجّل بالفعل بـ /api في آخره
// (مثال: https://89.167.10.171.nip.io/api) فلا نكرره هنا
const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string).replace(/\/$/, '') // ينتهي بـ /api
const SITE_URL = config.public.siteUrl as string
// نستخدمه فقط لبناء روابط الصور (بدون /api) لأن الصور تُخدم من الجذر
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, '')

// --- Fetch Post ---
const { data, pending, error: fetchError } = await useFetch<BlogPost>(
  `${API_BASE}/blog/blog-posts/${encodeURIComponent(slug)}/`,
  {
    key: `blog-post-${slug}`,
    server: true,
  }
)

watchEffect(() => {
  loading.value = pending.value
  if (data.value) {
    post.value = data.value
  }
  if (fetchError.value) {
    error.value = 'حدث خطأ أثناء جلب بيانات المقال'
  }
})

// --- Format Date ---
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// --- Strip HTML for excerpt ---
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
}

// --- Helper: تحويل مسار نسبي إلى رابط مطلق ---
const absoluteUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  return path.startsWith('http') ? path : `${MEDIA_BASE}${path}`
}

// --- هل المقال اتحدّث فعلياً بعد النشر؟ ---
// نقارن updated_at بـ published_at (أو created_at كبديل)
// بفارق أكبر من دقيقة، عشان الفروقات الطفيفة الناتجة عن عملية الحفظ الأولى
// (مثلاً auto_now_add و auto_now بنفس اللحظة تقريباً) ما تعتبر "تحديث"
const isUpdated = computed(() => {
  if (!post.value) return false
  const baseDate = post.value.published_at || post.value.created_at
  if (!post.value.updated_at || !baseDate) return false

  const updatedTime = new Date(post.value.updated_at).getTime()
  const baseTime = new Date(baseDate).getTime()

  return updatedTime - baseTime > 60 * 1000 // فرق أكثر من دقيقة
})

// --- Share URLs ---
const canonicalUrl = computed(() => `${SITE_URL}/news/${slug}`)

const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return canonicalUrl.value
})

// --- Breadcrumb data (نستخدمها بالـ HTML وبالـ JSON-LD مع بعض لضمان التطابق) ---
const breadcrumbItems = computed(() => {
  const items = [
    { name: 'الرئيسية', url: SITE_URL, path: '/' },
    { name: 'المقالات', url: `${SITE_URL}/blog`, path: '/blog' },
  ]
  if (post.value?.category) {
    items.push({
      name: post.value.category.name_ar,
      url: `${SITE_URL}/category/${post.value.category.slug}`,
      path: `/category/${post.value.category.slug}`,
    })
  }
  if (post.value) {
    items.push({
      name: post.value.title_ar,
      url: canonicalUrl.value,
      path: `/news/${slug}`,
    })
  }
  return items
})

const shareOnTwitter = () => {
  const text = encodeURIComponent(post.value?.title_ar || '')
  const url = encodeURIComponent(shareUrl.value)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

const shareOnFacebook = () => {
  const url = encodeURIComponent(shareUrl.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    alert('تم نسخ الرابط!')
  } catch {
    alert('تعذر نسخ الرابط')
  }
}

// --- SEO: Meta Tags ---
useHead(() => {
  if (!post.value) return {}

  const p = post.value
  const description = p.meta_description_ar || stripHtml(p.excerpt_ar)
  const image = absoluteUrl(p.og_image || p.featured_image) || `${SITE_URL}/default-og-image.jpg`
  const keywords = p.meta_keywords || p.tags.map(t => t.name_ar).join(', ')
  const publishedTime = p.published_at || p.created_at
  const modifiedTime = p.updated_at || publishedTime

  return {
    htmlAttrs: {
      lang: 'ar',
      dir: 'rtl',
    },
    title: p.meta_title_ar || p.title_ar,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: p.author_info.display_name_ar },

      // Open Graph
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: p.meta_title_ar || p.title_ar },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:site_name', content: 'عن مصر' },
      { property: 'og:locale', content: 'ar_AR' },

      // Article specific OG tags
      { property: 'article:published_time', content: publishedTime },
      { property: 'article:modified_time', content: modifiedTime },
      { property: 'article:author', content: p.author_info.display_name_ar },
      ...(p.tags.length
        ? p.tags.map(tag => ({ property: 'article:tag', content: tag.name_ar }))
        : []),

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: p.meta_title_ar || p.title_ar },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },

      // Robots
      {
        name: 'robots',
        content: p.is_published ? 'index, follow' : 'noindex, nofollow',
      },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
    // JSON-LD Structured Data
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title_ar,
          description: description,
          image: image ? [image] : [],
          datePublished: publishedTime,
          dateModified: modifiedTime,
          author: {
            '@type': 'Person',
            name: p.author_info.display_name_ar,
            ...(p.author_info.slug
              ? { url: `${SITE_URL}/author/${p.author_info.slug}` }
              : {}),
          },
          publisher: {
            '@type': 'Organization',
            name: 'عن مصر',
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl.value,
          },
          keywords: keywords || undefined,
          ...(p.category ? { articleSection: p.category.name_ar } : {}),
          interactionStatistic: [
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/ReadAction',
              userInteractionCount: p.views_count,
            },
            {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/LikeAction',
              userInteractionCount: p.likes_count,
            },
          ],
        }),
      },
    ],
  }
})

// --- Breadcrumb JSON-LD (مبني من نفس breadcrumbItems المستخدمة بالـ HTML لضمان التطابق) ---
useHead(() => {
  if (!post.value) return {}
  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems.value.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 py-16">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div class="h-80 bg-gray-200 rounded-xl"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !post"
      class="max-w-5xl mx-auto px-4 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error || 'المقال غير موجود' }}</p>
        <NuxtLink to="/blog" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block">
          العودة للمقالات
        </NuxtLink>
      </div>
    </div>

    <!-- Post Content -->
    <template v-else>
      <!-- Hero / Featured Image -->
      <div class="relative bg-surface">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <!-- Breadcrumb: HTML حقيقي + microdata (itemscope/itemprop) بجانب JSON-LD -->
          <nav
            class="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap"
            aria-label="Breadcrumb"
            itemscope
            itemtype="https://schema.org/BreadcrumbList"
          >
            <template v-for="(item, index) in breadcrumbItems" :key="item.path">
              <span
                itemprop="itemListElement"
                itemscope
                itemtype="https://schema.org/ListItem"
                class="flex items-center gap-2"
              >
                <!-- آخر عنصر (المقال الحالي) بدون رابط، الباقي روابط فعلية -->
                <span v-if="index === breadcrumbItems.length - 1" itemprop="name" class="text-body truncate max-w-[200px]">
                  {{ item.name }}
                </span>
                <NuxtLink
                  v-else
                  :to="item.path"
                  itemprop="item"
                  class="hover:text-primary-orange transition-colors"
                >
                  <span itemprop="name">{{ item.name }}</span>
                </NuxtLink>
                <meta itemprop="position" :content="String(index + 1)" />
              </span>

              <svg
                v-if="index < breadcrumbItems.length - 1"
                class="w-4 h-4 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </template>
          </nav>

          <!-- Category Badge -->
          <div v-if="post.category" class="mb-4">
            <span
              class="px-3 py-1 text-sm font-bold text-white rounded-full"
              :style="{ backgroundColor: post.category.color || '#EA580C' }"
            >
              {{ post.category.name_ar }}
            </span>
          </div>

          <!-- Title: h1 وحيد في الصفحة -->
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-dark leading-tight mb-4">
            {{ post.title_ar }}
          </h1>

          <!-- Excerpt -->
          <p class="text-lg text-muted mb-6 leading-relaxed">
            {{ post.excerpt_ar }}
          </p>

          <!-- Meta Bar -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-muted pb-6 border-b border-gray-200">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="font-medium text-body">{{ post.author_info.display_name_ar }}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <time :datetime="post.published_at || post.created_at">
                نُشر بتاريخ {{ formatDate(post.published_at || post.created_at) }}
              </time>
            </div>

            <!-- يظهر فقط لو المقال اتحدّث فعلياً بعد النشر بفارق حقيقي -->
            <div v-if="isUpdated" class="flex items-center gap-2 text-primary-orange">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <time :datetime="post.updated_at">
                آخر تحديث {{ formatDate(post.updated_at) }}
              </time>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ post.reading_time }} دقيقة قراءة</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>{{ post.views_count }} مشاهدة</span>
            </div>
          </div>
        </div>

        <!-- Featured Image -->
        <div v-if="post.featured_image" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div class="rounded-2xl overflow-hidden shadow-soft">
            <img
              :src="absoluteUrl(post.featured_image)"
              :alt="post.featured_image_alt || post.title_ar"
              width="1200"
              height="630"
              fetchpriority="high"
              class="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      <!-- Main Content + Sidebar -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Article Content -->
          <div class="lg:col-span-2">
            <!-- Article Body -->
            <article class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6 md:p-8 mb-8">
              <div
                class="prose prose-lg max-w-none prose-headings:text-primary-dark prose-headings:font-bold prose-p:text-body prose-p:leading-relaxed prose-a:text-primary-orange prose-a:no-underline hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal prose-li:text-body"
                v-html="post.content_ar"
              />
            </article>

            <!-- بطاقة الكاتب: انتقلت من الـ Sidebar لتكون تحت المقال مباشرة -->
            <!-- سبب النقل: تقوية الإشارة الدلالية (E-E-A-T) بربط الكاتب بالمحتوى مباشرة -->
            <div class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
              <div class="flex flex-col sm:flex-row items-start gap-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
                  <img
                    v-if="post.author_info.avatar"
                    :src="absoluteUrl(post.author_info.avatar)"
                    :alt="post.author_info.display_name_ar"
                    width="64"
                    height="64"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-primary-orange text-xl font-bold">
                    {{ post.author_info.display_name_ar.charAt(0) }}
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-lg font-bold text-primary-dark">{{ post.author_info.display_name_ar }}</h3>
                    <span
                      v-if="post.author_info.title_ar"
                      class="px-3 py-0.5 bg-orange-50 text-primary-orange text-xs font-semibold rounded-full border border-orange-100"
                    >
                      {{ post.author_info.title_ar }}
                    </span>
                  </div>

                  <p
                    v-if="post.author_info.bio_ar"
                    class="mt-2 text-sm text-muted leading-relaxed"
                  >
                    {{ post.author_info.bio_ar }}
                  </p>

                  <div class="flex flex-wrap items-center gap-4 mt-3">
                    <div class="flex items-center gap-3">
                      <a
                        v-if="post.author_info.twitter_url"
                        :href="post.author_info.twitter_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-8 h-8 rounded-full bg-gray-100 hover:bg-sky-500 hover:text-white text-muted flex items-center justify-center transition-all duration-200"
                        title="تويتر"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      <a
                        v-if="post.author_info.linkedin_url"
                        :href="post.author_info.linkedin_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white text-muted flex items-center justify-center transition-all duration-200"
                        title="لينكدإن"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a
                        v-if="post.author_info.email"
                        :href="`mailto:${post.author_info.email}`"
                        class="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary-orange hover:text-white text-muted flex items-center justify-center transition-all duration-200"
                        title="البريد الإلكتروني"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </a>
                    </div>

                    <NuxtLink
                      v-if="post.author_info.slug"
                      :to="`/author/${post.author_info.slug}`"
                      class="text-sm font-semibold text-primary-orange hover:underline"
                    >
                      عرض جميع مقالات الكاتب ←
                    </NuxtLink>
                  </div>
                </div>

                <div class="hidden sm:flex flex-col items-center gap-1 text-center border-r border-gray-100 pr-4 flex-shrink-0">
                  <span class="text-lg font-bold text-primary-dark">{{ post.author_info.posts_count || 0 }}</span>
                  <span class="text-xs text-muted">مقال</span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="post.tags.length > 0" class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
              <h3 class="text-lg font-bold text-primary-dark mb-4">الوسوم</h3>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in post.tags"
                  :key="tag.id"
                  :to="`/tag/${tag.slug}`"
                  class="px-4 py-2 bg-orange-50 text-primary-orange rounded-lg border border-orange-100 hover:bg-orange-100 hover:text-primary-orange transition-colors text-sm font-medium"
                >
                  {{ tag.name_ar }}
                </NuxtLink>
              </div>
            </div>

            <!-- Share & Actions -->
            <div class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-bold text-primary-dark mb-2">شارك المقال</h3>
                  <div class="flex gap-2">
                    <button
                      @click="shareOnTwitter"
                      class="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span class="hidden sm:inline">تويتر</span>
                    </button>
                    <button
                      @click="shareOnFacebook"
                      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span class="hidden sm:inline">فيسبوك</span>
                    </button>
                    <button
                      @click="copyLink"
                      class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-body rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      <span class="hidden sm:inline">نسخ الرابط</span>
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button
                    @click="liked = !liked"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    :class="liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-surface border-gray-200 text-muted hover:bg-gray-50'"
                  >
                    <svg class="w-5 h-5" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span>{{ post.likes_count + (liked ? 1 : 0) }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Navigation: Previous / Next -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <NuxtLink
                v-if="post.previous_post"
                :to="`/news/${post.previous_post.slug}`"
                class="group bg-surface rounded-xl shadow-soft border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div class="flex items-center gap-2 text-sm text-muted mb-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <span>المقال السابق</span>
                </div>
                <h4 class="font-bold text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-2">
                  {{ post.previous_post.title_ar }}
                </h4>
              </NuxtLink>

              <NuxtLink
                v-if="post.next_post"
                :to="`/news/${post.next_post.slug}`"
                class="group bg-surface rounded-xl shadow-soft border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 text-left"
              >
                <div class="flex items-center justify-end gap-2 text-sm text-muted mb-2">
                  <span>المقال التالي</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <h4 class="font-bold text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-2">
                  {{ post.next_post.title_ar }}
                </h4>
              </NuxtLink>
            </div>

            <!-- Comments Section -->
            <div v-if="post.allow_comments" class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 class="text-xl font-bold text-primary-dark mb-6">
                التعليقات ({{ post.comments_count }})
              </h3>

              <!-- Comments List -->
              <div v-if="post.comments.length > 0" class="space-y-6 mb-8">
                <div
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="border-b border-gray-100 pb-6 last:border-0"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-primary-orange font-bold">
                      {{ comment.author_name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-primary-dark">{{ comment.author_name }}</div>
                      <div class="text-xs text-muted">{{ formatDate(comment.created_at) }}</div>
                    </div>
                  </div>
                  <p class="text-body leading-relaxed mr-3">{{ comment.content }}</p>
                </div>
              </div>

              <div v-else class="text-center py-8 text-muted mb-6">
                لا توجد تعليقات بعد. كن أول من يعلق!
              </div>

              <!-- Comment Form -->
              <form class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-primary-dark mb-1">الاسم</label>
                    <input
                      type="text"
                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none transition-colors bg-light-bg"
                      placeholder="اسمك"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-primary-dark mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none transition-colors bg-light-bg"
                      placeholder="بريدك@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-primary-dark mb-1">التعليق</label>
                  <textarea
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none transition-colors resize-none bg-light-bg"
                    placeholder="اكتب تعليقك هنا..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  class="px-6 py-2 bg-primary-orange text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  إرسال التعليق
                </button>
              </form>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            <!-- WhatsApp & Telegram -->
            <div v-if="post.show_whatsapp_button || post.show_telegram_button" class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-primary-dark mb-4">تواصل معنا</h3>
              <div class="space-y-3">
                <a
                  v-if="post.show_whatsapp_button && post.whatsapp_url"
                  :href="post.whatsapp_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span>واتساب</span>
                </a>
                <a
                  v-if="post.show_telegram_button && post.telegram_url"
                  :href="post.telegram_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  <span>تلغرام</span>
                </a>
              </div>
            </div>

            <!-- Related Posts -->
            <div v-if="post.related_posts.length > 0" class="bg-surface rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-primary-dark mb-4">مقالات ذات صلة</h3>
              <div class="space-y-4">
                <NuxtLink
                  v-for="related in post.related_posts"
                  :key="related.id"
                  :to="`/news/${related.slug}`"
                  class="group flex gap-3 items-start"
                >
                  <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      v-if="related.featured_image"
                      :src="absoluteUrl(related.featured_image)"
                      :alt="related.title_ar"
                      width="80"
                      height="80"
                      loading="lazy"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-2 leading-snug">
                      {{ related.title_ar }}
                    </h4>
                    <div class="flex items-center gap-2 mt-1 text-xs text-muted">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {{ related.views_count }}
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>