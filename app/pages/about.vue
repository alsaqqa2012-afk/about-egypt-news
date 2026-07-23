<script setup lang="ts">
// ============================================================
// صفحة من نحن - About Us (ديناميكية من API)
// API: https://89.167.10.171.nip.io/api/pages/about-us/
// ============================================================
import { marked } from 'marked'

interface PageSection {
  id: number
  title: string
  content: string
  order: number
}

interface PageData {
  id: number
  title: string
  slug: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  content: string
  // ملاحظة: الـ API الحالي بيرجّع sections كـ object بمفاتيح ثابتة
  // (heroType, specialType...) مش كـ array من {id,title,content,order}.
  // خليناها any لحد ما يتحدد شكل نهائي متفق عليه بين الداشبورد والفرونت.
  sections: PageSection[] | Record<string, any>
  created_at: string
  updated_at: string
}

// --- Markdown renderer options ---
// breaks: true عشان ينش، أسطر جديدة (\n) تتحول لـ <br> زي ما المستخدم كاتبها بالداشبورد
marked.setOptions({ breaks: true })

// --- State ---
const page = ref<PageData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const apiAvailable = ref(true)

const API_BASE = 'https://89.167.10.171.nip.io'

// --- Fallback Data ---
const fallbackPage: PageData = {
  id: 1,
  title: 'من نحن',
  slug: 'about-us',
  meta_title: 'من نحن - عن مصر',
  meta_description: 'تعرف على منصة عن مصر ورسالتها ورؤيتها.',
  meta_keywords: 'عن مصر, من نحن, منصة إخبارية',
  content: `"عن مصر" منصة إخبارية متخصصة في نشر أحدث الأخبار والمعلومات المتعلقة بمصر والعالم العربي، تهدف إلى تقديم محتوى موثوق وشامل يغطي مختلف المجالات من أخبار عاجلة، وخدمات حكومية، ووظائف، وتعليم.`,
  sections: [
    {
      id: 1,
      title: 'رسالتنا',
      content: 'نسعى لتوفير معلومات دقيقة وحديثة تخدم القارئ العربي، وتساعده على متابعة آخر المستجدات بكل سهولة ووضوح.',
      order: 1,
    },
    {
      id: 2,
      title: 'رؤيتنا',
      content: 'أن نكون المصدر الأول الموثوق للأخبار والمعلومات المتعلقة بمصر، من خلال محتوى متجدد يواكب احتياجات القراء المختلفة.',
      order: 2,
    },
  ],
  created_at: '2026-01-01T00:00:00+03:00',
  updated_at: '2026-01-01T00:00:00+03:00',
}

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

// --- Fetch Page Data ---
const fetchPage = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await fetchWithRetry<PageData>(
      `${API_BASE}/api/pages/about-us/`
    )
    page.value = data
    apiAvailable.value = true
  } catch (err) {
    console.warn('API unavailable, using fallback data')
    page.value = fallbackPage
    apiAvailable.value = false
  } finally {
    loading.value = false
  }
}

// --- Markdown -> HTML helpers ---
// المحتوى القادم من الداشبورد Markdown خام، فلازم نحوله لـ HTML قبل عرضه بـ v-html
const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  return marked.parse(page.value.content) as string
})

const renderedSections = computed(() => {
  if (!page.value?.sections) return []
  // الشكل الحالي القادم من الـ API هو object (heroType, specialType...)
  // مش array — فبنعرض الـ sections array-style بس لو فعلاً كانت array.
  // إذا كانت object (الوضع الحالي)، منرجع مصفوفة فاضية مؤقتًا لحد ما
  // يتحدد شكل نهائي لعرض الـ sections دول (hero/values/vision-mission).
  if (!Array.isArray(page.value.sections)) return []

  return (page.value.sections as PageSection[])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      ...section,
      renderedContent: marked.parse(section.content || '') as string,
    }))
})

// --- Lifecycle ---
onMounted(() => {
  fetchPage()
})

// --- SEO ---
useHead(() => {
  if (!page.value) {
    return {
      title: 'من نحن - عن مصر',
      meta: [
        { name: 'description', content: 'تعرف على منصة عن مصر ورسالتها ورؤيتها.' },
      ],
    }
  }
  return {
    title: page.value.meta_title || page.value.title,
    meta: [
      {
        name: 'description',
        content: page.value.meta_description || '',
      },
      {
        name: 'keywords',
        content: page.value.meta_keywords || '',
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-12">
      <div class="animate-pulse space-y-6">
        <div class="h-10 bg-gray-200 rounded w-1/3"></div>
        <div class="h-6 bg-gray-200 rounded w-full"></div>
        <div class="h-6 bg-gray-200 rounded w-5/6"></div>
        <div class="h-8 bg-gray-200 rounded w-1/4 mt-8"></div>
        <div class="h-6 bg-gray-200 rounded w-full"></div>
        <div class="h-8 bg-gray-200 rounded w-1/4 mt-8"></div>
        <div class="h-6 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !page"
      class="max-w-4xl mx-auto px-4 py-16 text-center"
    >
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="fetchPage"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="page">
      <!-- API Status Warning -->
      <div v-if="!apiAvailable" class="bg-amber-50 border-b border-amber-200">
        <div class="max-w-4xl mx-auto px-4 py-3 text-center">
          <p class="text-amber-700 text-sm">
            ⚠️ وضع العرض التجريبي - البيانات من المخزن المحلي
          </p>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-muted mb-6">
          <NuxtLink to="/" class="hover:text-primary-orange transition-colors">الرئيسية</NuxtLink>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="text-body">{{ page.title }}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center gap-2 mb-8">
          <div class="w-1 h-8 bg-primary-orange rounded" />
          <h1 class="text-2xl md:text-3xl font-bold text-primary-dark">
            {{ page.title }}
          </h1>
        </div>

        <!-- Main Content -->
        <div
          v-if="page.content"
          class="prose max-w-none space-y-6 text-body leading-relaxed"
          v-html="renderedContent"
        />

        <!-- Sections -->
        <div v-if="renderedSections.length > 0" class="mt-8 space-y-8">
          <div
            v-for="section in renderedSections"
            :key="section.id"
            class="prose max-w-none"
          >
            <h2 class="text-xl font-bold text-primary-dark mt-8 mb-4">
              {{ section.title }}
            </h2>
            <div
              class="text-body leading-relaxed"
              v-html="section.renderedContent"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.prose :deep(h1) {
  @apply text-2xl font-bold text-primary-dark mt-6 mb-4;
}
.prose :deep(h2) {
  @apply text-xl font-bold text-primary-dark mt-8 mb-4;
}
.prose :deep(h3) {
  @apply text-lg font-bold text-primary-dark mt-6 mb-3;
}
.prose :deep(p) {
  @apply text-body leading-relaxed mb-4;
}
.prose :deep(ul) {
  @apply list-disc list-inside space-y-2 mr-4 mb-4;
}
.prose :deep(ol) {
  @apply list-decimal list-inside space-y-2 mr-4 mb-4;
}
.prose :deep(li) {
  @apply text-body;
}
.prose :deep(a) {
  @apply text-primary-orange hover:underline;
}
.prose :deep(strong) {
  @apply font-bold text-primary-dark;
}
</style>