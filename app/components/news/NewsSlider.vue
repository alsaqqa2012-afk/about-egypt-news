<template>
  <div class="relative bg-gradient-to-r from-primary-dark to-primary-dark/80 rounded-lg overflow-hidden shadow-xl">
    <!-- Swiper Slider -->
    <Swiper
      :modules="[Navigation, Pagination, Autoplay]"
      :slides-per-view="1"
      :space-between="0"
      :navigation="true"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      class="w-full"
    >
      <SwiperSlide v-for="article in articles" :key="article.id">
        <div class="relative h-96 overflow-hidden group">
          <!-- Background Image -->
          <img
            v-if="article.image"
            :src="article.image"
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-primary-orange to-primary-dark" />

          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          <!-- Content -->
          <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
            <!-- Category Badge -->
            <div class="mb-4 flex items-center gap-2">
              <span class="inline-block bg-primary-orange text-dark px-4 py-1 rounded-full text-sm font-bold">
                {{ article.category }}
              </span>
              <span class="text-sm text-gray-300">{{ formatDate(article.publishedAt) }}</span>
            </div>

            <!-- Title -->
            <h2 class="text-2xl md:text-4xl font-bold mb-3 leading-tight line-clamp-3">
              {{ article.title }}
            </h2>

            <!-- Excerpt -->
            <p class="text-sm md:text-base text-gray-200 mb-4 line-clamp-2">
              {{ article.excerpt }}
            </p>

            <!-- Read More Button -->
            <NuxtLink
              :to="`/article/${article.id}`"
              class="inline-block bg-primary-orange text-dark px-6 py-2 rounded-lg font-bold hover:bg-light-bg transition-colors w-fit"
            >
              اقرأ المزيد
            </NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Article {
  id: string | number
  title: string
  excerpt: string
  image?: string
  category: string
  publishedAt: string | Date
}

defineProps<{
  articles: Article[]
}>()

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #FE7F2D;
  background: rgba(0, 0, 0, 0.5);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(254, 127, 45, 0.8);
}

:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.6);
}

:deep(.swiper-pagination-bullet-active) {
  background: #FE7F2D;
}
</style>