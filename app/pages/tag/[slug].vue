<script setup lang="ts">
interface Tag {
  id: number
  name_ar: string
  slug: string
  posts_count: number
}

interface AuthorInfo {
  display_name_ar: string
  slug?: string
  avatar?: string
  title_ar?: string
}

interface Category {
  id: number
  name_ar: string
  slug: string
  icon: string
  color: string
}

interface PostListItem {
  id: number
  title_ar: string
  slug: string
  excerpt_ar: string
  featured_image: string | null
  category: Category | null
  tags: { id: number; name_ar: string; slug: string }[]
  author_info: AuthorInfo | null
  created_at: string
  views_count: number
}

interface PaginatedResponse<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
}

// --- Route ---
const route = useRoute()
const slug = route.params.slug as string
const page = computed(() => Number(route.query.page) || 1)

// --- Config ---
const config = useRuntimeConfig()
const API_BASE = (config.public.apiBase as string).replace(/\/?$/, '/')
const SITE_URL = config.public.siteUrl as string
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, '')

// --- Fetch Tag Info ---
const { data: tagData, error: tagError } = await useFetch<Tag>(
  `${API_BASE}blog/blog-tags/${slug}/`,  // ✅ بدون encodeURIComponent
  {
    key: `tag-${slug}`,
    server: true,
  }
)

// --- Fetch Posts ---
const { data: postsData, pending, error: postsError } =
  await useFetch<PostListItem[] | PaginatedResponse<PostListItem>>(
    `${API_BASE}blog/blog-tags/${slug}/posts/`,  // ✅ بدون encodeURIComponent
    {
      key: `tag-posts-${slug}-${page.value}`,
      server: true,
      query: { page: page.value },
    }
  )

// --- استخراج المقالات ---
const posts = computed<PostListItem[]>(() => {
  if (!postsData.value) return []
  if (Array.isArray(postsData.value)) return postsData.value
  return postsData.value.results || []
})

const hasNextPage = computed(() => {
  if (!postsData.value || Array.isArray(postsData.value)) return false
  return !!postsData.value.next
})

const hasPrevPage = computed(() => {
  if (!postsData.value || Array.isArray(postsData.value)) return false
  return !!postsData.value.previous
})

const notFound = computed(() => !!tagError.value)

// --- Helpers ---
const absoluteUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  return path.startsWith('http') ? path : `${MEDIA_BASE}${path}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 160)
}

// --- Breadcrumb ---
const canonicalUrl = computed(() => `${SITE_URL}/tag/${slug}`)

const breadcrumbItems = computed(() => {
  const items = [
    { name: 'الرئيسية', url: SITE_URL, path: '/' },
    { name: 'المقالات', url: `${SITE_URL}/news`, path: '/news' },
  ]
  if (tagData.value) {
    items.push({
      name: `وسم: ${tagData.value.name_ar}`,
      url: canonicalUrl.value,
      path: `/tag/${slug}`,
    })
  }
  return items
})

// --- SEO ---
useHead(() => {
  if (!tagData.value) return {}
  const t = tagData.value
  const title = `مقالات بوسم ${t.name_ar}`
  const description = `تصفح كل المقالات المصنّفة تحت وسم "${t.name_ar}" (${t.posts_count} مقال).`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl.value },
      { name: 'robots', content: 'index, follow' },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
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
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: canonicalUrl.value,
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">
    <!-- حالة الخطأ: الوسم غير موجود -->
    <div v-if="notFound" class="max-w-5xl mx-auto px-4 py-16 text-center">
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">لم يتم العثور على هذا الوسم</p>
        <NuxtLink to="/news" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block">
          العودة للمقالات
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <!-- Breadcrumb -->
        <nav
          class="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap"
          aria-label="Breadcrumb"
          itemscope
          itemtype="https://schema.org/BreadcrumbList"
        >
          <template v-for="(item, index) in breadcrumbItems" :key="item.path">
            <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center gap-2">
              <span v-if="index === breadcrumbItems.length - 1" itemprop="name" class="text-body truncate max-w-[240px]">
                {{ item.name }}
              </span>
              <NuxtLink v-else :to="item.path" itemprop="item" class="hover:text-primary-orange transition-colors">
                <span itemprop="name">{{ item.name }}</span>
              </NuxtLink>
              <meta itemprop="position" :content="String(index + 1)" />
            </span>
            <svg v-if="index < breadcrumbItems.length - 1" class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </template>
        </nav>

        <!-- عنوان الصفحة -->
        <div class="mb-8">
          <span class="inline-block px-3 py-1 text-xs font-bold text-primary-orange bg-orange-50 rounded-full border border-orange-100 mb-3">
            وسم
          </span>
          <h1 class="text-3xl md:text-4xl font-bold text-primary-dark leading-tight">
            {{ tagData?.name_ar }}
          </h1>
          <p v-if="tagData" class="text-muted mt-2">
            {{ tagData.posts_count }} مقال منشور تحت هذا الوسم
          </p>
        </div>

        <!-- حالة التحميل -->
        <div v-if="pending" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse bg-surface rounded-xl border border-gray-100 p-4 flex gap-4">
            <div class="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- لا توجد مقالات -->
        <div v-else-if="!posts.length" class="text-center py-16 bg-surface rounded-xl border border-gray-100">
          <p class="text-muted">لا توجد مقالات منشورة تحت هذا الوسم حالياً</p>
        </div>

        <!-- قائمة المقالات -->
        <div v-else class="space-y-4">
          <article
            v-for="post in posts"
            :key="post.id"
            class="bg-surface rounded-xl shadow-soft border border-gray-100 p-4 hover:shadow-lg transition-shadow"
          >
            <NuxtLink :to="`/news/${post.slug}`" class="flex flex-col sm:flex-row gap-4 group">
              <div class="w-full sm:w-40 h-40 sm:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  v-if="post.featured_image"
                  :src="absoluteUrl(post.featured_image)"
                  :alt="post.title_ar"
                  width="160"
                  height="112"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <span
                  v-if="post.category"
                  class="inline-block text-xs font-bold text-white px-2 py-0.5 rounded-full mb-2"
                  :style="{ backgroundColor: post.category.color || '#417690' }"
                >
                  {{ post.category.name_ar }}
                </span>
                <h2 class="font-bold text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-2 leading-snug">
                  {{ post.title_ar }}
                </h2>
                <p class="text-sm text-muted mt-1 line-clamp-2">
                  {{ stripHtml(post.excerpt_ar) }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span v-if="post.author_info">{{ post.author_info.display_name_ar }}</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    {{ post.views_count }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- ترقيم الصفحات -->
        <div v-if="hasPrevPage || hasNextPage" class="flex items-center justify-between mt-8">
          <NuxtLink
            v-if="hasPrevPage"
            :to="{ path: `/tag/${slug}`, query: { page: page - 1 } }"
            class="px-4 py-2 bg-surface border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← الصفحة السابقة
          </NuxtLink>
          <span v-else></span>

          <NuxtLink
            v-if="hasNextPage"
            :to="{ path: `/tag/${slug}`, query: { page: page + 1 } }"
            class="px-4 py-2 bg-surface border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            الصفحة التالية →
          </NuxtLink>
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
</style>
