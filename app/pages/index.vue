<script setup lang="ts">
// ============================================================
// الصفحة الرئيسية مع السكاشن الديناميكية
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

interface Section {
  category: Category
  posts: BlogPost[]
  loading: boolean
  error: string | null
}

// --- State ---
const categories = ref<Category[]>([])
const sections = ref<Section[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const apiAvailable = ref(true)

const API_BASE = 'https://89.167.10.171.nip.io'

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

// --- Fetch Categories ---
const fetchCategories = async (): Promise<Category[]> => {
  try {
    const data = await fetchWithRetry<ApiResponse<Category>>(
      `${API_BASE}/api/blog/blog-categories/`
    )
    const filtered = data.results.filter((c) => c.show_on_menu && c.posts_count > 0)
    if (filtered.length > 0) {
      apiAvailable.value = true
      return filtered
    }
  } catch (err) {
    console.warn('API unavailable, using fallback data')
  }
  apiAvailable.value = false
  return fallbackCategories
}

// --- Fetch Posts by Category (CORRECT ENDPOINT) ---
const fetchPostsByCategory = async (slug: string): Promise<BlogPost[]> => {
  if (!apiAvailable.value) {
    return fallbackPosts
  }
  try {
    const data = await fetchWithRetry<ApiResponse<BlogPost>>(
      `${API_BASE}/api/blog/blog-categories/${encodeURIComponent(slug)}/posts/`
    )
    return data.results.slice(0, 6)
  } catch (err) {
    console.warn(`Failed to fetch posts for ${slug}, using fallback`)
    return fallbackPosts
  }
}

// --- Fetch All Sections ---
const fetchAllSections = async () => {
  loading.value = true
  error.value = null

  try {
    const cats = await fetchCategories()
    categories.value = cats

    sections.value = cats.map((cat) => ({
      category: cat,
      posts: [],
      loading: true,
      error: null,
    }))

    await Promise.all(
      sections.value.map(async (section) => {
        try {
          const posts = await fetchPostsByCategory(section.category.slug)
          section.posts = posts
        } catch (err) {
          section.error = 'فشل تحميل المقالات'
        } finally {
          section.loading = false
        }
      })
    )
  } catch (err) {
    error.value = 'حدث خطأ أثناء تحميل الأقسام'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
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
  return html.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
}

// --- Lifecycle ---
onMounted(() => {
  fetchAllSections()
})

// --- SEO ---
useHead({
  title: 'الرئيسية - عن مصر',
  meta: [
    {
      name: 'description',
      content: 'بوابتك للأخبار والخدمات - استكشف أحدث المقالات والموضوعات المتنوعة',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-16">
      <div class="animate-pulse space-y-12">
        <div class="h-64 bg-gray-200 rounded-2xl"></div>
        <div v-for="n in 3" :key="n" class="space-y-4">
          <div class="h-8 bg-gray-200 rounded w-1/4"></div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="m in 3" :key="m" class="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State (Only if NO sections at all) -->
    <div
      v-else-if="error && sections.length === 0"
      class="max-w-7xl mx-auto px-4 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchAllSections"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- API Status Warning -->
      <div v-if="!apiAvailable" class="bg-amber-50 border-b border-amber-200">
        <div class="max-w-7xl mx-auto px-4 py-3 text-center">
          <p class="text-amber-700 text-sm">
            ⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي
          </p>
        </div>
      </div>

      <!-- Hero -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              عن مصر
            </h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              بوابتك للأخبار والخدمات - استكشف أحدث المقالات والموضوعات المتنوعة
            </p>
          </div>
        </div>
      </section>

      <!-- Dynamic Sections -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div v-for="section in sections" :key="section.category.id">
          <!-- Section Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <div
                class="w-1 h-8 rounded"
                :style="{ backgroundColor: section.category.color || '#f97316' }"
              />
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
                {{ section.category.name_ar }}
              </h2>
              <span class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ section.category.posts_count }}
              </span>
            </div>
            <NuxtLink
              :to="`/category/${section.category.slug}`"
              class="text-orange-600 font-medium hover:text-orange-700 transition-colors flex items-center gap-1"
            >
              عرض الكل
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </NuxtLink>
          </div>

          <!-- Section Loading -->
          <div v-if="section.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" class="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          <!-- Section Error -->
          <div v-else-if="section.error" class="text-center py-8 text-gray-500">
            {{ section.error }}
          </div>

          <!-- Posts Grid -->
          <div v-else-if="section.posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="post in section.posts"
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
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed">
                  <NuxtLink :to="`/news/${post.slug}`">
                    {{ post.title_ar }}
                  </NuxtLink>
                </h3>

                <!-- Excerpt -->
                <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {{ stripHtml(post.excerpt_ar) }}
                </p>

                <!-- Meta -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
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
              </div>
            </article>
          </div>

          <!-- Empty Section -->
          <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p class="text-gray-500">لا توجد مقالات في هذا القسم</p>
          </div>
        </div>

        <!-- No Sections -->
        <div v-if="sections.length === 0" class="text-center py-20">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p class="text-gray-500 text-lg">لا توجد أقسام متاحة حالياً</p>
        </div>
      </section>
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