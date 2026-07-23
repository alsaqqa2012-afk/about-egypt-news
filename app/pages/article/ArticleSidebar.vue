<template>
  <div class="space-y-6">
    <!-- مشاركة -->
    <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 class="text-lg font-bold mb-4">مشاركة المقال</h3>
      <div class="flex gap-2">
        <button class="social">Facebook</button>
        <button class="social">X</button>
        <button class="social">WhatsApp</button>
      </div>
    </div>

    <!-- مقالات ذات صلة -->
    <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 class="text-lg font-bold mb-4">مقالات ذات صلة</h3>

      <div v-if="relatedArticles.length" class="space-y-4">
        <NuxtLink
          v-for="item in relatedArticles"
          :key="item.id"
          :to="`/articles/${item.slug}`"
          class="block p-3 rounded-xl border border-gray-100 hover:border-primary-orange hover:bg-orange-50/40 transition"
        >
          <p class="font-bold line-clamp-2 mb-1">{{ item.title }}</p>
          <p class="text-sm text-slate-500">{{ item.category }}</p>
        </NuxtLink>
      </div>

      <p v-else class="text-sm text-slate-500">لا توجد مقالات مرتبطة حاليًا.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RelatedArticle {
  id: number
  slug: string
  title: string
  category: string
}
defineProps<{
  relatedArticles: RelatedArticle[]
}>()
</script>

<style scoped>
.social {
  @apply text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-primary-orange hover:text-white transition;
}
</style>
