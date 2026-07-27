<template>
  <footer class="bg-primary-dark text-white mt-14">
    <div class="max-w-7xl mx-auto px-4 py-12">
      
      <!-- Grid الرئيسي -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        <!-- العمود 1: الشعار والوصف -->
        <div class="flex flex-col items-center md:items-start">
          <NuxtLink to="/" class="flex items-center gap-3 group transition-transform hover:scale-105">
            <div class="relative w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="شعار عن مصر" class="w-full h-full object-contain" />
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-bold font-display tracking-wide leading-none text-white">
                عن <span class="text-primary-orange">مصر</span>
              </span>
              <span class="text-[10px] text-gray-400 font-medium tracking-tighter mt-1">
                بوابتك للأخبار والخدمات
              </span>
            </div>
          </NuxtLink>
          <p class="text-sm text-gray-300 mt-4 text-center md:text-right leading-7">
            منصة إخبارية متخصصة في نشر أحدث الأخبار والمعلومات والخدمات في مصر.
          </p>
        </div>

        <!-- العمود 2: روابط سريعة -->
        <div>
          <h4 class="text-lg font-bold mb-4 border-b border-primary-orange pb-2">روابط سريعة</h4>
          <ul class="space-y-2 text-gray-200">
            <li><NuxtLink to="/" class="hover:text-primary-orange transition">الرئيسية</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-primary-orange transition">من نحن</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-primary-orange transition">اتصل بنا</NuxtLink></li>
            <li><NuxtLink to="/privacy-policy" class="hover:text-primary-orange transition">سياسة الخصوصية</NuxtLink></li>
          </ul>
        </div>

        <!-- العمود 3: الأقسام -->
        <div>
          <h4 class="text-lg font-bold mb-4 border-b border-primary-orange pb-2">الأقسام</h4>
          <ul class="space-y-2 text-gray-200">
            <li v-for="category in displayedCategories" :key="category.id">
              <NuxtLink
                :to="`/category/${encodeURIComponent(category.slug || category.name)}`"
                class="hover:text-primary-orange transition flex items-center gap-2"
              >
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: category.color || '#417690' }"
                ></span>
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- العمود 4: تابعنا -->
        <div>
          <h4 class="text-lg font-bold mb-4 border-b border-primary-orange pb-2">تابعنا</h4>
          <div class="flex gap-3">
            <a href="#" class="social-btn" aria-label="Facebook">
              <span class="iconify i-mdi:facebook w-5 h-5" aria-hidden="true"></span>
            </a>
            <a href="#" class="social-btn" aria-label="Twitter">
              <span class="iconify i-mdi:twitter w-5 h-5" aria-hidden="true"></span>
            </a>
            <a href="#" class="social-btn" aria-label="WhatsApp">
              <span class="iconify i-mdi:whatsapp w-5 h-5" aria-hidden="true"></span>
            </a>
            <a href="#" class="social-btn" aria-label="Telegram">
              <span class="iconify i-mdi:telegram w-5 h-5" aria-hidden="true"></span>
            </a>
          </div>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-600 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="text-sm text-gray-300">
          جميع الحقوق محفوظة © 2026 <span class="text-primary-orange font-bold">عن مصر</span>
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

<script setup>
const { categories } = useCategories()

const displayedCategories = computed(() => {
  return (categories.value || []).slice(0, 6)
})
</script>