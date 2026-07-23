<script setup lang="ts">
// ============================================================
// صفحة تفاصيل الفئة - Category Detail
// المسار: /category/:slug
// API Categories: /api/blog/blog-categories/
// API Posts: /api/blog/blog-categories/{slug}/posts/
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
  description_ar: string
  icon: string
  color: string
  image: string | null
  order: number
  is_active: boolean
  show_on_menu: boolean
  posts_count: number
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
}

interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// --- Route ---
const route = useRoute()
const slug = route.params.slug as string

// --- State ---
const category = ref<Category | null>(null)
const posts = ref<BlogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalCount = ref(0)
const hasMore = ref(false)
const apiAvailable = ref(true)

const API_BASE = 'https://89.167.10.171.nip.io'

// --- Fallback Data ---
const fallbackCategory: Category = {
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
}

const fallbackPosts: BlogPost[] = [
  {
    id: 447,
    title_ar: 'كيف يمكن للانسان صناعة روبوت للاطفال بسهولة',
    slug: 'كيف-يمكن-للانسان-صناعة-روبوت-للاطفال-بسهولة',
    excerpt_ar: 'تعرف على كيفية صناعة روبون للأطفال خطوة بخطوة، مع نصائح وأفكار مبتكرة تجعل العملية ممتعة وتعليمية.',
    content_ar: '',
    featured_image: 'https://89.167.10.171.nip.io/media/blog/posts/HNTD-FOWAAA7Ii9.jpg',
    category: null,
    tags: [
      { id: 77, name_ar: 'خرف', slug: 'خرف' },
      { id: 78, name_ar: 'سكين', slug: 'سكين' },
      { id: 75, name_ar: 'ملكية', slug: 'ملكية' },
      { id: 76, name_ar: 'منشار', slug: 'منشار' },
    ],
    author_info: { display_name_ar: 'admin' },
    created_at: '2026-07-18T10:18:36.535195+03:00',
    views_count: 0,
  },
]

// --- Fetch with Retry ---
const fetchWithRetry = async <T,>(url: string, retries = 2): Promise<T> => {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      return await $fetch<T>(url, { retry: 0, timeout: 10000 })
    } catch (err) {
      lastError = err
      console.warn(`Attempt ${i + 1} failed for ${url}`, err)
      if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastError
}

// --- Fetch Category + Posts ---
const fetchCategoryData = async () => {
  loading.value = true
  error.value = null

  try {
    // 1. جلب تفاصيل الفئة
    const categoriesData = await fetchWithRetry<ApiResponse<Category>>(
      `${API_BASE}/api/blog/blog-categories/`
    )
    const foundCategory = categoriesData.results.find((c) => c.slug === slug)

    if (!foundCategory) {
      // استخدام fallback لو الفئة مش موجودة في API
      category.value = fallbackCategory
      apiAvailable.value = false
    } else {
      category.value = foundCategory
      apiAvailable.value = true
    }

    // 2. جلب المقالات التابعة للفئة
    await fetchPosts()
  } catch (err) {
    console.error('Error:', err)
    // استخدام fallback
    category.value = fallbackCategory
    apiAvailable.value = false
    await fetchPosts()
  }
}

// --- Fetch Posts (CORRECT ENDPOINT) ---
const fetchPosts = async () => {
  try {
    const data = await fetchWithRetry<ApiResponse<BlogPost>>(
      `${API_BASE}/api/blog/blog-categories/${encodeURIComponent(slug)}/posts/?page=${currentPage.value}`
    )

    if (currentPage.value === 1) {
      posts.value = data.results
    } else {
      posts.value.push(...data.results)
    }

    totalCount.value = data.count
    hasMore.value = !!data.next
  } catch (err) {
    console.error('Error fetching posts:', err)
    // استخدام fallback
    if (currentPage.value === 1) {
      posts.value = fallbackPosts
      totalCount.value = fallbackPosts.length
    }
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// --- Load More ---
const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  await fetchPosts()
}

// --- Format Date ---
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// --- Strip HTML ---
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
}

// --- Lifecycle ---
onMounted(() => {
  fetchCategoryData()
})

// --- Watch slug changes ---
watch(() => route.params.slug, () => {
  currentPage.value = 1
  posts.value = []
  fetchCategoryData()
})

// --- SEO ---
useHead(() => {
  if (!category.value) return {}
  return {
    title: `${category.value.name_ar} - عن مصر`,
    meta: [
      {
        name: 'description',
        content: category.value.description_ar || `استعرض أحدث المقالات في قسم ${category.value.name_ar}`,
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- API Status Warning -->
    <div v-if="!apiAvailable" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-7xl mx-auto px-4 py-3 text-center">
        <p class="text-amber-700 text-sm">
          ⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي
        </p>
      </div>
    </div>

    <!-- Category Header -->
    <section
      v-if="category"
      class="relative overflow-hidden"
      :style="{ backgroundColor: category.color || '#1e293b' }"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-white/70 mb-6">
          <NuxtLink to="/" class="hover:text-white transition-colors">الرئيسية</NuxtLink>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="text-white">{{ category.name_ar }}</span>
        </nav>

        <div class="flex items-center gap-4">
          <!-- Category Icon Placeholder -->
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>

          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ category.name_ar }}
            </h1>
            <p v-if="category.description_ar" class="text-white/80 text-lg max-w-2xl">
              {{ category.description_ar }}
            </p>
            <div class="flex items-center gap-4 mt-3 text-white/70 text-sm">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ totalCount }} مقال
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading && posts.length === 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div class="h-48 bg-gray-200"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && posts.length === 0"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchCategoryData"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Posts Grid -->
    <section v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Results Count -->
      <div class="flex items-center justify-between mb-8">
        <p class="text-gray-600">
          تم العثور على <span class="font-bold text-gray-900">{{ totalCount }}</span> مقال
        </p>

        <!-- Sort Dropdown (placeholder) -->
        <select class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="popular">الأكثر مشاهدة</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Image -->
          <div class="relative h-48 overflow-hidden bg-gray-100">
            <img
              v-if="post.featured_image"
              :src="post.featured_image.startsWith('http') ? post.featured_image : API_BASE + post.featured_image"
              :alt="post.title_ar"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
            >
              <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Category Badge -->
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
              <NuxtLink :to="`/news/${post.slug}`">
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
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{{ post.author_info.display_name_ar }}</span>
              </div>

              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ post.views_count }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="posts.length === 0 && !loading" class="text-center py-20">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <p class="text-gray-500 text-lg">لا توجد مقالات في هذا القسم</p>
        <NuxtLink to="/" class="mt-4 inline-block text-orange-600 font-medium hover:text-orange-700">
          العودة للرئيسية
        </NuxtLink>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center mt-12">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>تحميل المزيد</span>
        </button>
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>