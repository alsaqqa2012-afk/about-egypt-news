<template>
  <div class="space-y-6">
    <!-- آخر الأخبار (مصغّرة) -->
    <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 class="text-lg font-bold mb-4">آخر الأخبار</h3>

      <div v-if="latestArticles?.length" class="space-y-4">
        <div
          v-for="item in latestArticles"
          :key="item.id"
          class="flex gap-3 items-start"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
            @error="onImageError"
          />
          <div>
            <p class="font-bold line-clamp-2 text-sm">{{ item.title }}</p>
            <span class="text-xs text-slate-500">{{ formatDate(item.publishedAt) }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-slate-500">لا توجد أخبار حاليًا.</p>
    </div>

    <!-- الأكثر قراءة -->
    <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 class="text-lg font-bold mb-4">الأكثر قراءة</h3>

      <ol v-if="mostReadArticles?.length" class="space-y-3">
        <li
          v-for="(item, index) in mostReadArticles"
          :key="item.id"
          class="flex items-center gap-3"
        >
          <span class="text-primary-orange font-black text-lg w-6 shrink-0">{{ index + 1 }}</span>
          <div>
            <p class="font-bold line-clamp-2 text-sm">{{ item.title }}</p>
            <span class="text-xs text-slate-500">{{ item.views }} مشاهدة</span>
          </div>
        </li>
      </ol>
      <p v-else class="text-sm text-slate-500">لا توجد بيانات حاليًا.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SidebarArticle {
  id: string | number
  title: string
  image?: string
  publishedAt?: string | Date
  views?: number
}

defineProps<{
  latestArticles?: SidebarArticle[]
  mostReadArticles?: SidebarArticle[]
}>()

function formatDate(date?: string | Date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
  })
}

function onImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/images/placeholder.png'
}
</script>