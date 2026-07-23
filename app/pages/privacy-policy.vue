<script setup lang="ts">
// ============================================================
// صفحة سياسة الخصوصية - Privacy Policy (ديناميكية من API)
// API: https://89.167.10.171.nip.io/api/pages/privacy-policy/
// ============================================================
import { marked } from 'marked'

interface PageData {
  id: number
  title: string
  slug: string
  content: string
  meta_description: string
  meta_keywords: string
  banner_image_url: string | null
  thumbnail_image_url: string | null
  is_published: boolean
  show_in_menu: boolean
  menu_order: number
  created_at: string
  updated_at: string
}

// --- Markdown renderer options ---
marked.setOptions({ breaks: true })

// --- State ---
const page = ref<PageData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const apiAvailable = ref(true)

const API_BASE = 'https://89.167.10.171.nip.io'

// --- Fallback Data (من البيانات اللي ارسلتها) ---
const fallbackPage: PageData = {
  id: 6,
  title: 'سياسة الخصوصية',
  slug: 'privacy-policy',
  content: `مرحبًا بكم في موقع **عن مصر**. نحن نولي أهمية كبيرة لخصوصية زوارنا، ونلتزم بحماية المعلومات التي يتم جمعها واستخدامها وفقًا لأفضل الممارسات والمعايير المتبعة.

## المعلومات التي نقوم بجمعها

قد نقوم بجمع بعض المعلومات عند زيارة المستخدم للموقع، مثل:

* عنوان بروتوكول الإنترنت (IP).
* نوع المتصفح والجهاز المستخدم.
* الصفحات التي يتم زيارتها ومدة التصفح.
* المعلومات التي يرسلها المستخدم بشكل مباشر عبر نماذج التواصل أو الاشتراك.

يتم استخدام هذه المعلومات لتحسين تجربة المستخدم وتطوير محتوى وخدمات الموقع.

## ملفات تعريف الارتباط (Cookies)

يستخدم موقع **عن مصر** ملفات تعريف الارتباط (Cookies) لتحسين أداء الموقع وتقديم تجربة أفضل للزوار، مثل تذكر تفضيلات المستخدم وتحليل حركة الزيارات.

يمكن للمستخدم التحكم في ملفات تعريف الارتباط أو تعطيلها من خلال إعدادات المتصفح الخاص به.

## الإعلانات

قد يستخدم الموقع خدمات إعلانية مثل **Google AdSense** لعرض الإعلانات المناسبة للزوار. وقد تستخدم هذه الخدمات ملفات تعريف الارتباط وتقنيات مشابهة لعرض إعلانات تعتمد على اهتمامات المستخدمين.

يمكن للمستخدم معرفة المزيد عن كيفية استخدام Google للمعلومات من خلال سياسة الخصوصية الخاصة بخدمات Google.

## تحليلات الموقع

قد نستخدم أدوات تحليل الزيارات لفهم كيفية استخدام الزوار للموقع، وتحسين المحتوى وتجربة الاستخدام، دون جمع معلومات شخصية حساسة.

## حماية المعلومات

نحرص على اتخاذ الإجراءات المناسبة لحماية بيانات المستخدمين ومنع الوصول غير المصرح به إليها، مع العلم أن نقل البيانات عبر الإنترنت لا يمكن ضمان أمانه بشكل كامل.

## روابط المواقع الخارجية

قد يحتوي موقعنا على روابط لمواقع خارجية. نحن غير مسؤولين عن محتوى أو سياسات الخصوصية الخاصة بهذه المواقع، وننصح المستخدمين بمراجعة سياسات الخصوصية الخاصة بها.

## حقوق المستخدم

يحق للمستخدم طلب معرفة المعلومات المتعلقة به أو طلب حذفها إذا كانت متوفرة لدينا، وذلك وفق القوانين والأنظمة المعمول بها.

## تحديث سياسة الخصوصية

قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التغييرات في الخدمات أو القوانين. سيتم نشر أي تحديثات على هذه الصفحة.

## التواصل معنا

إذا كان لديك أي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر صفحة **اتصل بنا**.

آخر تحديث: 2026`,
  meta_description: 'سياسة الخصوصية لموقع عن مصر توضح كيفية جمع واستخدام وحماية بيانات الزوار، وملفات تعريف الارتباط، والإعلانات، وحقوق المستخدمين.',
  meta_keywords: 'سياسة الخصوصية, عن مصر, حماية البيانات, cookies',
  banner_image_url: null,
  thumbnail_image_url: null,
  is_published: true,
  show_in_menu: false,
  menu_order: 0,
  created_at: '2026-07-21T11:14:22.560004+03:00',
  updated_at: '2026-07-21T11:14:22.560027+03:00',
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
      `${API_BASE}/api/pages/privacy-policy/`
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

// --- Markdown -> HTML helper ---
const renderedContent = computed(() => {
  if (!page.value?.content) return ''
  return marked.parse(page.value.content) as string
})

// --- Lifecycle ---
onMounted(() => {
  fetchPage()
})

// --- SEO ---
useHead(() => {
  if (!page.value) {
    return {
      title: 'سياسة الخصوصية - عن مصر',
      meta: [
        { name: 'description', content: 'اطلع على سياسة الخصوصية الخاصة بموقع عن مصر.' },
      ],
    }
  }
  return {
    title: `${page.value.title} - عن مصر`,
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

        <!-- Main Content (Markdown rendered) -->
        <div
          v-if="page.content"
          class="prose max-w-none space-y-6 text-body leading-relaxed"
          v-html="renderedContent"
        />
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