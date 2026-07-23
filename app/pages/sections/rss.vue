<template>
  <div>
    <!-- Page Header -->
    <section class="bg-primary-dark text-white py-8">
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">التلقيمات والخرائط</h1>
        <p class="text-gray-300">اشترك في خلاصات الأخبار واحصل على آخر التحديثات من جميع الأقسام</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content Area -->
        <div class="lg:col-span-2 space-y-8">
          <!-- RSS Feeds Section -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header -->
            <div class="bg-primary-dark text-white px-6 py-4 flex items-center gap-3">
              <Icon name="mdi:rss" class="w-6 h-6 text-primary-orange" />
              <h2 class="text-2xl font-bold">خلاصات الأخبار (RSS)</h2>
            </div>

            <!-- Content -->
            <div class="p-6">
              <p class="text-gray-600 mb-6">
                اشترك في خلاصات الأخبار لتلقي آخر الأخبار والتحديثات من أقسام الموقع المختلفة. يمكنك استخدام أي تطبيق قارئ RSS للاشتراك في هذه الخلاصات.
              </p>

              <!-- RSS Feeds List -->
              <div class="space-y-3">
                <div
                  v-for="(feed, index) in rssFeeds"
                  :key="index"
                  class="flex items-center justify-between p-4 bg-light-bg rounded-lg hover:bg-primary-dark/5 transition group"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <Icon name="mdi:rss" class="w-5 h-5 text-primary-orange flex-shrink-0" />
                    <div>
                      <h3 class="font-bold text-primary-dark group-hover:text-primary-orange transition">
                        {{ feed.name }}
                      </h3>
                      <p class="text-xs text-gray-500 mt-1">{{ feed.description }}</p>
                    </div>
                  </div>

                  <!-- Copy URL Button -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button
                      @click="copyToClipboard(feed.url)"
                      class="p-2 bg-primary-orange text-white rounded hover:bg-primary-dark transition tooltip"
                      :title="`نسخ رابط ${feed.name}`"
                    >
                      <Icon name="mdi:content-copy" class="w-4 h-4" />
                    </button>
                    <a
                      :href="feed.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 bg-primary-dark text-white rounded hover:bg-primary-orange transition"
                      :title="`فتح خلاصة ${feed.name}`"
                    >
                      <Icon name="mdi:open-in-new" class="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- How to Subscribe Section -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-bold text-primary-dark mb-4">كيفية الاشتراك</h3>
                <ol class="space-y-3 text-gray-600">
                  <li class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <span>اختر تطبيق قارئ RSS (مثل Feedly أو Inoreader أو Google Reader)</span>
                  </li>
                  <li class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <span>انسخ رابط الخلاصة التي تريد الاشتراك فيها</span>
                  </li>
                  <li class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <span>الصق الرابط في التطبيق واضغط على "اشترك"</span>
                  </li>
                  <li class="flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                    <span>ستتلقى جميع الأخبار الجديدة تلقائياً</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <!-- Sitemaps Section -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header -->
            <div class="bg-primary-dark text-white px-6 py-4 flex items-center gap-3">
              <Icon name="mdi:sitemap" class="w-6 h-6 text-primary-orange" />
              <h2 class="text-2xl font-bold">خرائط الموقع (Sitemaps)</h2>
            </div>

            <!-- Content -->
            <div class="p-6">
              <p class="text-gray-600 mb-6">
                خرائط الموقع تساعد محركات البحث على فهرسة محتوى الموقع بشكل أفضل. يمكنك تحميل هذه الملفات أو استخدامها مباشرة.
              </p>

              <!-- Sitemaps List -->
              <div class="space-y-3">
                <div
                  v-for="(sitemap, index) in sitemaps"
                  :key="index"
                  class="flex items-center justify-between p-4 bg-light-bg rounded-lg hover:bg-primary-dark/5 transition group"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <Icon name="mdi:sitemap" class="w-5 h-5 text-primary-orange flex-shrink-0" />
                    <div>
                      <h3 class="font-bold text-primary-dark group-hover:text-primary-orange transition">
                        {{ sitemap.name }}
                      </h3>
                      <p class="text-xs text-gray-500 mt-1">{{ sitemap.description }}</p>
                    </div>
                  </div>

                  <!-- Copy URL Button -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button
                      @click="copyToClipboard(sitemap.url)"
                      class="p-2 bg-primary-orange text-white rounded hover:bg-primary-dark transition"
                      :title="`نسخ رابط ${sitemap.name}`"
                    >
                      <Icon name="mdi:content-copy" class="w-4 h-4" />
                    </button>
                    <a
                      :href="sitemap.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 bg-primary-dark text-white rounded hover:bg-primary-orange transition"
                      :title="`فتح ${sitemap.name}`"
                    >
                      <Icon name="mdi:open-in-new" class="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- Main Sitemap -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-bold text-primary-dark mb-4">خريطة الموقع الرئيسية</h3>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-primary-orange text-dark font-bold rounded-lg hover:bg-primary-dark hover:text-white transition"
                >
                  <Icon name="mdi:download" class="w-5 h-5" />
                  تحميل خريطة الموقع الرئيسية
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <Sidebar
            :latest-articles="sidebarLatestArticles"
            :most-read-articles="mostReadArticles"
          />
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCopyNotification"
          class="fixed bottom-4 right-4 bg-primary-orange text-dark px-6 py-3 rounded-lg shadow-lg font-bold"
        >
          تم نسخ الرابط بنجاح!
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Feed {
  name: string
  description: string
  url: string
}

interface Sitemap {
  name: string
  description: string
  url: string
}

const showCopyNotification = ref(false)

// RSS Feeds Data
const rssFeeds = ref<Feed[]>([
  {
    name: 'عن مصر',
    description: 'آخر الأخبار عن مصر والمعلومات العامة',
    url: 'https://yoursite.com/rss/about-egypt.xml',
  },
  {
    name: 'الخدمات',
    description: 'الخدمات الحكومية والعامة',
    url: 'https://yoursite.com/rss/services.xml',
  },
  {
    name: 'وظائف',
    description: 'فرص التوظيف والعمل',
    url: 'https://yoursite.com/rss/jobs.xml',
  },
  {
    name: 'التعليم',
    description: 'أخبار التعليم والدراسة',
    url: 'https://yoursite.com/rss/education.xml',
  },
  {
    name: 'أخبار التعليم',
    description: 'آخر أخبار القطاع التعليمي',
    url: 'https://yoursite.com/rss/education-news.xml',
  },
  {
    name: 'الامتحانات',
    description: 'جداول وأخبار الامتحانات',
    url: 'https://yoursite.com/rss/exams.xml',
  },
  {
    name: 'النتائج',
    description: 'نتائج الامتحانات والاختبارات',
    url: 'https://yoursite.com/rss/results.xml',
  },
  {
    name: 'التنسيق',
    description: 'معلومات التنسيق والالتحاق',
    url: 'https://yoursite.com/rss/coordination.xml',
  },
  {
    name: 'التموين',
    description: 'أخبار التموين والمواد الغذائية',
    url: 'https://yoursite.com/rss/food-supply.xml',
  },
  {
    name: 'الكهرباء',
    description: 'أخبار الكهرباء والطاقة',
    url: 'https://yoursite.com/rss/electricity.xml',
  },
  {
    name: 'المعاشات',
    description: 'معلومات المعاشات والتقاعد',
    url: 'https://yoursite.com/rss/pensions.xml',
  },
])

// Sitemaps Data
const sitemaps = ref<Sitemap[]>([
  {
    name: 'خريطة عن مصر',
    description: 'خريطة موقع قسم عن مصر',
    url: 'https://yoursite.com/sitemap/about-egypt.xml',
  },
  {
    name: 'خريطة الخدمات',
    description: 'خريطة موقع قسم الخدمات',
    url: 'https://yoursite.com/sitemap/services.xml',
  },
  {
    name: 'خريطة الوظائف',
    description: 'خريطة موقع قسم الوظائف',
    url: 'https://yoursite.com/sitemap/jobs.xml',
  },
  {
    name: 'خريطة التعليم',
    description: 'خريطة موقع قسم التعليم',
    url: 'https://yoursite.com/sitemap/education.xml',
  },
  {
    name: 'خريطة أخبار التعليم',
    description: 'خريطة موقع أخبار التعليم',
    url: 'https://yoursite.com/sitemap/education-news.xml',
  },
  {
    name: 'خريطة الامتحانات',
    description: 'خريطة موقع الامتحانات',
    url: 'https://yoursite.com/sitemap/exams.xml',
  },
  {
    name: 'خريطة النتائج',
    description: 'خريطة موقع النتائج',
    url: 'https://yoursite.com/sitemap/results.xml',
  },
  {
    name: 'خريطة التنسيق',
    description: 'خريطة موقع التنسيق',
    url: 'https://yoursite.com/sitemap/coordination.xml',
  },
  {
    name: 'خريطة التموين',
    description: 'خريطة موقع التموين',
    url: 'https://yoursite.com/sitemap/food-supply.xml',
  },
  {
    name: 'خريطة الكهرباء',
    description: 'خريطة موقع الكهرباء',
    url: 'https://yoursite.com/sitemap/electricity.xml',
  },
  {
    name: 'خريطة المعاشات',
    description: 'خريطة موقع المعاشات',
    url: 'https://yoursite.com/sitemap/pensions.xml',
  },
])

// Sidebar Articles (Mock Data)
const sidebarLatestArticles = ref([
  {
    id: 1,
    title: 'آخر خبر هام جداً',
    image: 'https://via.placeholder.com/100x100?text=Latest+1',
    publishedAt: new Date(),
  },
  {
    id: 2,
    title: 'تطور جديد في الموضوع',
    image: 'https://via.placeholder.com/100x100?text=Latest+2',
    publishedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 3,
    title: 'استقصاء صحفي مهم',
    image: 'https://via.placeholder.com/100x100?text=Latest+3',
    publishedAt: new Date(Date.now() - 7200000),
  },
])

const mostReadArticles = ref([
  {
    id: 1,
    title: 'المقال الأكثر قراءة',
    views: 5420,
    publishedAt: new Date(),
  },
  {
    id: 2,
    title: 'مقال مشهور جداً',
    views: 4890,
    publishedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 3,
    title: 'خبر شهير',
    views: 4120,
    publishedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 4,
    title: 'موضوع مهم جداً',
    views: 3950,
    publishedAt: new Date(Date.now() - 259200000),
  },
  {
    id: 5,
    title: 'قصة مثيرة للاهتمام',
    views: 3680,
    publishedAt: new Date(Date.now() - 345600000),
  },
])

// Copy to Clipboard Function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopyNotification.value = true
    setTimeout(() => {
      showCopyNotification.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Set page title and meta
useHead({
  title: 'التلقيمات والخرائط - عن مصر',
  meta: [
    {
      name: 'description',
      content: 'خلاصات الأخبار (RSS) وخرائط الموقع (Sitemaps) لموقع عن مصر الإخباري',
    },
    {
      name: 'keywords',
      content: 'RSS، خلاصات، خرائط الموقع، Sitemap',
    },
  ],
})
</script>

<style scoped>
.tooltip {
  position: relative;
}

.tooltip:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #233D4D;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  font-size: 0.75rem;
  z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
