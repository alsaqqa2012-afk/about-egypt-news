<template>
  <aside class="space-y-6">
    <!-- Latest News Widget -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Header -->
      <div class="bg-primary-dark text-white px-4 py-3 flex items-center gap-2">
        <div class="w-1 h-6 bg-primary-orange rounded" />
        <h3 class="text-lg font-bold">آخر الموضوعات</h3>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4">
        <NuxtLink
          v-for="article in latestArticles"
          :key="article.id"
          :to="`/article/${article.id}`"
          class="flex gap-3 group hover:bg-light-bg p-2 rounded transition"
        >
          <!-- Thumbnail -->
          <div class="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-light-bg">
            <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-primary-dark to-primary-orange flex items-center justify-center">
              <Icon name="mdi:image-off" class="w-6 h-6 text-white opacity-50" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-primary-dark group-hover:text-primary-orange transition line-clamp-2">
              {{ article.title }}
            </h4>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(article.publishedAt) }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Most Read Widget -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Header -->
      <div class="bg-primary-dark text-white px-4 py-3 flex items-center gap-2">
        <div class="w-1 h-6 bg-primary-orange rounded" />
        <h3 class="text-lg font-bold">الأكثر قراءة</h3>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4">
        <NuxtLink
          v-for="(article, index) in mostReadArticles"
          :key="article.id"
          :to="`/article/${article.id}`"
          class="flex gap-3 group hover:bg-light-bg p-2 rounded transition"
        >
          <!-- Number Badge -->
          <div class="w-8 h-8 flex-shrink-0 bg-primary-orange text-dark rounded-full flex items-center justify-center font-bold text-sm">
            {{ index + 1 }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-primary-dark group-hover:text-primary-orange transition line-clamp-2">
              {{ article.title }}
            </h4>
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Icon name="mdi:eye" class="w-3 h-3" />
              {{ article.views || 0 }} مشاهدة
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Advertisement Widget (Optional) -->
    <div class="bg-light-bg rounded-lg shadow-md p-4 text-center">
      <div class="bg-white rounded h-64 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <Icon name="mdi:image-frame" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p class="text-sm">مساحة إعلانية</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface Article {
  id: string | number
  title: string
  image?: string
  publishedAt: string | Date
  views?: number
}

defineProps<{
  latestArticles: Article[]
  mostReadArticles: Article[]
}>()

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>
