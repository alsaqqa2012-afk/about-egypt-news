<template>
  <div class="bg-light-bg min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-muted mb-6" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary-orange transition">الرئيسية</NuxtLink>
        <Icon name="mdi:chevron-left" class="w-4 h-4" />
        <NuxtLink :to="`/sections/${article.categorySlug}`" class="hover:text-primary-orange transition">
          {{ article.category }}
        </NuxtLink>
        <Icon name="mdi:chevron-left" class="w-4 h-4" />
        <span class="text-body">{{ article.subCategory }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Main article column -->
        <article class="lg:col-span-2">
          <!-- Title -->
          <h1 class="text-3xl md:text-4xl font-bold text-primary-dark leading-snug mb-4">
            {{ article.title }}
          </h1>

          <!-- Meta row -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-muted mb-6 pb-6 border-b border-gray-200">
            <span class="flex items-center gap-1.5">
              <Icon name="mdi:account-circle-outline" class="w-5 h-5" />
              {{ article.author }}
            </span>
            <span class="flex items-center gap-1.5">
              <Icon name="mdi:calendar-blank-outline" class="w-5 h-5" />
              {{ article.publishedAt }}
            </span>
            <NuxtLink
              :to="`/sections/${article.categorySlug}`"
              class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-orange/10 text-primary-orange font-medium hover:bg-primary-orange hover:text-white transition"
            >
              <Icon name="mdi:tag-outline" class="w-4 h-4" />
              {{ article.category }}
            </NuxtLink>
          </div>

          <!-- Hero image -->
          <div class="rounded-xl overflow-hidden mb-8 shadow-sm">
            <img
              :src="article.image"
              :alt="article.title"
              class="w-full h-[280px] md:h-[420px] object-cover"
            >
          </div>

          <!-- Body -->
          <div class="prose prose-lg max-w-none text-body leading-loose space-y-6">
            <p v-for="(paragraph, i) in article.content" :key="i">
              {{ paragraph }}
            </p>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
            <NuxtLink
              v-for="tag in article.tags"
              :key="tag"
              :to="`/tags/${tag}`"
              class="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-muted hover:border-primary-orange hover:text-primary-orange transition"
            >
              #{{ tag }}
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="lg:col-span-1 lg:sticky lg:top-24">
          <div class="bg-surface rounded-xl border border-gray-200 p-5">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-1 h-7 bg-primary-orange rounded" />
              <h2 class="text-lg font-bold text-primary-dark">أخبار ذات صلة</h2>
            </div>

            <div class="space-y-4">
              <NuxtLink
                v-for="related in relatedArticles"
                :key="related.id"
                :to="`/article/${related.id}`"
                class="flex gap-3 group"
              >
                <img
                  :src="related.image"
                  :alt="related.title"
                  class="w-24 h-20 rounded-lg object-cover shrink-0"
                >
                <div class="min-w-0">
                  <span class="text-xs font-medium text-primary-orange">{{ related.category }}</span>
                  <h3 class="text-sm font-bold text-primary-dark leading-snug line-clamp-2 group-hover:text-primary-orange transition">
                    {{ related.title }}
                  </h3>
                  <span class="text-xs text-muted flex items-center gap-1 mt-1">
                    <Icon name="mdi:calendar-blank-outline" class="w-3.5 h-3.5" />
                    {{ related.publishedAt }}
                  </span>
                </div>
              </NuxtLink>
            </div>

            <NuxtLink
              to="/sections/all"
              class="block text-center mt-6 py-3 rounded-lg bg-primary-orange text-white font-bold hover:bg-primary-dark transition-colors"
            >
              عرض المزيد من الأخبار
            </NuxtLink>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RelatedArticle {
  id: string | number
  title: string
  image: string
  category: string
  publishedAt: string
}

interface FullArticle {
  id: string | number
  title: string
  category: string
  categorySlug: string
  subCategory: string
  author: string
  publishedAt: string
  image: string
  content: string[]
  tags: string[]
}

const route = useRoute()

// Mock data - استبدل هذا باستدعاء API حقيقي بناءً على route.params.id
const article = ref<FullArticle>({
  id: route.params.id as string,
  title: 'الأهرامات في الجيزة.. عظمة خالدة وحضارة لا تُنسى',
  category: 'سياحة',
  categorySlug: 'sections/tourism',
  subCategory: 'معالم أثرية',
  author: 'أحمد عبد الرحيم',
  publishedAt: '25 مايو 2025',
  image: 'https://via.placeholder.com/1200x600?text=Giza+Pyramids',
  content: [
    'تُعد أهرامات الجيزة واحدة من أعظم الإنجازات المعمارية في تاريخ البشرية، وأحد أبرز رموز الحضارة المصرية القديمة التي ما زالت تُبهر العالم حتى يومنا هذا. تقع هذه الأهرامات الثلاثة الشاهقة على الهضبة الغربية لنهر النيل، وتحديدًا في الجيزة، على بُعد حوالي 20 كيلومترًا من قلب القاهرة.',
    'تم بناء هذه الأهرامات خلال الأسرة الرابعة من الدولة القديمة، وتحديدًا في عهد الملك خوفو (الهرم الأكبر)، والملك خفرع، والملك منقرع. وقد استغرق بناء الهرم الأكبر وحده أكثر من 20 عامًا، وشارك في تشييده آلاف العمال المهرة الذين أبدعوا في استخدام تقنيات هندسية متقدمة لا تزال تثير دهشة العلماء والمهندسين حتى اليوم.',
    'ولا يزال أبو الهول، ذلك التمثال الصخري الضخم بجسد أسد ورأس إنسان، يقف شامخًا بجوار الأهرامات، حارسًا صامتًا لأسرار الحضارة المصرية العريقة، ووجهة لا يفوتها أي زائر لمصر.',
  ],
  tags: ['أهرامات', 'الجيزة', 'آثار مصرية', 'سياحة'],
})

const relatedArticles = ref<RelatedArticle[]>([
  {
    id: 101,
    title: 'المتحف المصري الكبير.. صرح حضاري يروي تاريخ مصر العريق',
    image: 'https://via.placeholder.com/200x160?text=GEM',
    category: 'سياحة',
    publishedAt: 'مايو 2025',
  },
  {
    id: 102,
    title: 'أبو الهول.. الحارس الصامت لأسرار الحضارة المصرية',
    image: 'https://via.placeholder.com/200x160?text=Sphinx',
    category: 'معالم أثرية',
    publishedAt: 'مايو 2025',
  },
  {
    id: 103,
    title: 'الأقصر.. متحف مفتوح يحكي أسرار الفراعنة',
    image: 'https://via.placeholder.com/200x160?text=Luxor',
    category: 'سياحة داخلية',
    publishedAt: 'مايو 2025',
  },
])

useHead({
  title: computed(() => `${article.value.title} - عن مصر`),
  meta: [
    { name: 'description', content: computed(() => article.value.content[0]?.slice(0, 150)) },
  ],
})
</script>