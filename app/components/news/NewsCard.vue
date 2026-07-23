<template>
  <NuxtLink
    :to="`/article/${article.id}`"
    class="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
  >
    <!-- Image Container -->
    <div class="relative overflow-hidden bg-light-bg h-48">
      <img
        v-if="article.image"
        :src="article.image"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-primary-dark to-primary-orange flex items-center justify-center">
        <Icon name="mdi:image-off" class="w-12 h-12 text-white opacity-50" />
      </div>

      <!-- Category Badge -->
      <div class="absolute top-3 right-3 bg-primary-orange text-white px-3 py-1 rounded-full text-xs font-bold">
        {{ article.category }}
      </div>

      <!-- Overlay on Hover -->
      <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="text-lg font-bold text-primary-dark group-hover:text-primary-orange transition-colors line-clamp-2 mb-2">
        {{ article.title }}
      </h3>

      <!-- Excerpt -->
      <p class="text-sm text-gray-600 line-clamp-2 mb-3">
        {{ article.excerpt }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ formatDate(article.publishedAt) }}</span>
        <span class="flex items-center gap-1">
          <Icon name="mdi:eye" class="w-4 h-4" />
          {{ article.views || 0 }}
        </span>
      </div>
    </div>
  </NuxtLink>
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

defineProps<{
  article: Article
}>()

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
</script>
