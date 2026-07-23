<script setup lang="ts">
// ============================================================
// صفحة قائمة المقالات - Blog Posts List
// جلب البيانات من الـ Client فقط لتجنب مشاكل SSR مع الـ API
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

// --- State ---
const posts = ref<BlogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const totalCount = ref(0)

const API_BASE = 'https://89.167.10.171.nip.io'

// --- Fetch Data (Client Only) ---
const fetchPosts = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await $fetch<ApiResponse>(`${API_BASE}/api/blog/blog-posts/`, {
      retry: 1,
    })

    if (data && data.results) {
      posts.value = data.results
      totalCount.value = data.count
    } else {
      error.value = 'لم يتم العثور على بيانات'
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    error.value = 'حدث خطأ أثناء جلب البيانات. حاول مرة أخرى.'
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

// --- Strip HTML from excerpt ---
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
}

// --- Lifecycle: Fetch on Client ---
onMounted(() => {
  fetchPosts()
})

// --- SEO (static since we don't have data at SSR time) ---
useHead({
  title:  'آخر الأخبار | عن مصر',
  meta: [
    {
      name: 'description',
      content: 'اطلع على أحدث الأخبار العاجلة، والتقارير السياسية والاقتصادية والرياضية والتكنولوجية من موقع عن مصر.'    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            المقالات
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            استكشف مجموعة متنوعة من الموضوعات المفيدة والمقالات المتخصصة
          </p>
          <div class="mt-4 text-sm text-gray-500">
            إجمالي المقالات: <span class="font-bold text-orange-600">{{ totalCount }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      v-else-if="error"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg
          class="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchPosts"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Posts Grid -->
    <section v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Featured Image -->
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
              <svg
                class="w-16 h-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
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
            <h2
              class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed"
            >
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
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{{ post.author_info.display_name_ar }}</span>
              </div>

              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {{ post.views_count }}
                </span>
                <span class="flex items-center gap-1">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div
        v-if="posts.length === 0 && !loading"
        class="text-center py-16"
      >
        <svg
          class="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p class="text-gray-500 text-lg">لا توجد مقالات متاحة حالياً</p>
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
