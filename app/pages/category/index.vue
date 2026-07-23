<script setup lang="ts">
// ============================================================
// صفحة كل الأقسام - Categories List
// المسار: /category/
// API: /api/blog/blog-categories/
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

// --- State ---
const categories = ref<Category[]>([])
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
const fetchCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await fetchWithRetry<ApiResponse<Category>>(
      `${API_BASE}/api/blog/blog-categories/`
    )
    const filtered = data.results.filter((c) => c.is_active && c.posts_count > 0)
    if (filtered.length > 0) {
      apiAvailable.value = true
      categories.value = filtered
    } else {
      categories.value = []
    }
  } catch (err) {
    console.warn('API unavailable, using fallback data')
    apiAvailable.value = false
    categories.value = fallbackCategories
  } finally {
    loading.value = false
  }
}

// --- Lifecycle ---
onMounted(() => {
  fetchCategories()
})

// --- SEO ---
useHead({
  title: 'الأقسام - عن مصر',
  meta: [
    {
      name: 'description',
      content: 'استعرض جميع أقسام الموقع والموضوعات المتاحة',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-16">
      <div class="animate-pulse space-y-8">
        <div class="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="h-56 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && categories.length === 0"
      class="max-w-7xl mx-auto px-4 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchCategories"
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

      <!-- Header -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <!-- Breadcrumb -->
            <nav class="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <NuxtLink to="/" class="hover:text-orange-600 transition-colors">الرئيسية</NuxtLink>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              <span class="text-gray-700">الأقسام</span>
            </nav>

            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              الأقسام
            </h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              استعرض جميع أقسام الموقع واكتشف الموضوعات المتنوعة
            </p>
            <div class="mt-4 text-sm text-gray-500">
              إجمالي الأقسام: <span class="font-bold text-orange-600">{{ categories.length }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Grid -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/category/${cat.slug}`"
            class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Category Header with Color -->
            <div
              class="h-24 flex items-center justify-center relative overflow-hidden"
              :style="{ backgroundColor: cat.color || '#f97316' }"
            >
              <!-- Pattern -->
              <div class="absolute inset-0 opacity-10">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <pattern :id="'grid-' + cat.id" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
                  </pattern>
                  <rect width="100" height="100" :fill="'url(#grid-' + cat.id + ')'"/>
                </svg>
              </div>

              <!-- Icon -->
              <div class="relative w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {{ cat.posts_count }} مقال
                </span>
                <span class="text-orange-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  تصفح
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div v-if="categories.length === 0" class="text-center py-20">
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
</style>