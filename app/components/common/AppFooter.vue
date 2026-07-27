<template>
  <footer class="bg-primary-dark text-white mt-14">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Logo + About -->
        <div class="flex flex-col items-center md:items-start">
          <AppLogo />
          <p class="text-sm text-gray-300 mt-4 text-center md:text-right leading-7">
            منصة إخبارية متخصصة في نشر أحدث الأخبار والمعلومات والخدمات في مصر.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold !text-white mb-4 border-b border-primary-orange pb-2">
  روابط سريعة
</h4>
          <ul class="space-y-2 text-gray-200">
            <li><NuxtLink to="/" class="hover:text-primary-orange transition">الرئيسية</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-primary-orange transition">من نحن</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-primary-orange transition">اتصل بنا</NuxtLink></li>
            <li><NuxtLink to="/privacy-policy" class="hover:text-primary-orange transition">سياسة الخصوصية</NuxtLink></li>
          </ul>
        </div>

        <!-- Dynamic Categories -->
        <div>
          <h4 class="text-lg font-bold !text-white mb-4 border-b border-primary-orange pb-2">
  الأقسام
</h4>

          <!-- Loading -->
          <div v-if="loading" class="space-y-2">
            <div v-for="n in 4" :key="n" class="h-5 bg-white/10 rounded animate-pulse w-3/4"></div>
          </div>

          <!-- Categories List -->
          <ul v-else-if="categories.length > 0" class="space-y-2 text-gray-200">
            <li v-for="cat in displayedCategories" :key="cat.id">
              <NuxtLink
                :to="`/category/${cat.slug}`"
                class="hover:text-primary-orange transition flex items-center gap-2"
              >
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: cat.color || '#f97316' }"
                />
                {{ cat.name_ar }}
              </NuxtLink>
            </li>
            <li v-if="categories.length > maxCategories">
              <NuxtLink
                to="/category"
                class="text-primary-orange hover:text-white transition text-sm font-medium"
              >
                عرض كل الأقسام ({{ categories.length }})
              </NuxtLink>
            </li>
          </ul>

          <!-- Empty -->
          <p v-else class="text-gray-400 text-sm">لا توجد أقسام</p>
        </div>

        <!-- Social -->
        <div>
          <h4 class="text-lg font-bold !text-white mb-4 border-b border-primary-orange pb-2">
  تابعنا
</h4>
          <div class="flex gap-3">
            <a href="#" class="social-btn" aria-label="Facebook"><Icon name="mdi:facebook" class="w-5 h-5" /></a>
            <a href="#" class="social-btn" aria-label="Twitter"><Icon name="mdi:twitter" class="w-5 h-5" /></a>
            <a href="#" class="social-btn" aria-label="WhatsApp"><Icon name="mdi:whatsapp" class="w-5 h-5" /></a>
            <a href="#" class="social-btn" aria-label="Telegram"><Icon name="mdi:telegram" class="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-600 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-sm text-gray-300">
          جميع الحقوق محفوظة © {{ currentYear }}
          <span class="text-primary-orange font-bold">عن مصر</span>
        </p>
        <div class="flex items-center gap-4 text-sm text-gray-400">
          <NuxtLink to="/editorial-policy" class="hover:text-primary-orange transition">سياسة النشر</NuxtLink>
          <span class="text-gray-600">|</span>
          <NuxtLink to="/terms-and-conditions" class="hover:text-primary-orange transition">الشروط والأحكام</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { categories, loading } = useCategories()

const maxCategories = 6
const displayedCategories = computed(() => categories.value.slice(0, maxCategories))

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.social-btn {
  @apply w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center hover:bg-light-bg hover:text-primary-dark transition;
}
</style>