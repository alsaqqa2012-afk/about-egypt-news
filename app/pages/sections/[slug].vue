<template>
  <div>
    <section class="max-w-7xl mx-auto px-4 py-8">
      <!-- Section Header -->
      <div v-if="section" class="flex items-center gap-2 mb-8">
        <div class="w-1 h-8 bg-primary-orange rounded" />
        <h1 class="text-2xl md:text-3xl font-bold text-primary-dark">{{ section.title }}</h1>
      </div>

      <!-- Articles Grid -->
      <div v-if="section" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NewsCard
          v-for="article in section.articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="section" class="flex justify-center mt-8">
        <button
          class="px-8 py-3 bg-primary-orange text-dark font-bold rounded-lg hover:bg-primary-dark hover:text-white transition-colors"
        >
          تحميل المزيد
        </button>
      </div>

      <!-- Section Not Found -->
      <div v-if="!section" class="text-center py-20">
        <p class="text-xl text-gray-500">القسم غير موجود.</p>
        <NuxtLink to="/" class="text-primary-orange font-bold mt-4 inline-block">
          العودة للصفحة الرئيسية
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Article {
  id: string | number
  title: string
  excerpt: string
  image?: string
  category: string
  publishedAt: string | Date
  views?: number
}

interface SectionData {
  title: string
  articles: Article[]
}

const route = useRoute()
const slug = route.params.slug as string

// Mock Data لكل قسم - استبدلها لاحقًا ببيانات حقيقية من API
const sectionsData: Record<string, SectionData> = {
  'about-egypt': {
    title: 'عن مصر',
    articles: [
      {
        id: 8,
        title: 'معلومات عن مصر',
        excerpt: 'تعرف على الحقائق المهمة عن مصر',
        image: 'https://via.placeholder.com/400x300?text=Egypt+Info',
        category: 'عن مصر',
        publishedAt: new Date(),
        views: 650,
      },
      {
        id: 9,
        title: 'التراث المصري',
        excerpt: 'استكشف الحضارة المصرية العريقة',
        image: 'https://via.placeholder.com/400x300?text=Egypt+Heritage',
        category: 'عن مصر',
        publishedAt: new Date(Date.now() - 86400000),
        views: 1100,
      },
    ],
  },
  services: {
    title: 'الخدمات',
    articles: [
      {
        id: 10,
        title: 'الخدمات الحكومية',
        excerpt: 'دليل الخدمات الحكومية المتاحة',
        image: 'https://via.placeholder.com/400x300?text=Services',
        category: 'الخدمات',
        publishedAt: new Date(),
        views: 340,
      },
      {
        id: 11,
        title: 'كيفية الاستفادة من الخدمات',
        excerpt: 'خطوات سهلة للاستفادة من الخدمات',
        image: 'https://via.placeholder.com/400x300?text=How+To',
        category: 'الخدمات',
        publishedAt: new Date(Date.now() - 172800000),
        views: 280,
      },
    ],
  },
  jobs: {
    title: 'وظائف',
    articles: [
      {
        id: 12,
        title: 'فرص عمل جديدة',
        excerpt: 'أحدث فرص التوظيف المتاحة',
        image: 'https://via.placeholder.com/400x300?text=Jobs',
        category: 'وظائف',
        publishedAt: new Date(),
        views: 2100,
      },
      {
        id: 13,
        title: 'نصائح للبحث عن عمل',
        excerpt: 'نصائح مهمة عند البحث عن فرصة عمل',
        image: 'https://via.placeholder.com/400x300?text=Job+Tips',
        category: 'وظائف',
        publishedAt: new Date(Date.now() - 259200000),
        views: 890,
      },
    ],
  },
  education: {
    title: 'التعليم',
    articles: [
      {
        id: 14,
        title: 'أخبار التعليم',
        excerpt: 'آخر أخبار القطاع التعليمي',
        image: 'https://via.placeholder.com/400x300?text=Education',
        category: 'التعليم',
        publishedAt: new Date(),
        views: 1450,
      },
      {
        id: 15,
        title: 'دليل الدراسة',
        excerpt: 'نصائح وإرشادات للطلاب',
        image: 'https://via.placeholder.com/400x300?text=Study+Guide',
        category: 'التعليم',
        publishedAt: new Date(Date.now() - 345600000),
        views: 760,
      },
    ],
  },
}

const section = computed<SectionData | null>(() => sectionsData[slug] || null)

useHead({
  title: computed(() => section.value ? `${section.value.title} - عن مصر` : 'القسم غير موجود - عن مصر'),
  meta: [
    { name: 'description', content: computed(() => section.value ? `تصفح آخر أخبار قسم ${section.value.title}` : '') },
  ],
})
</script>