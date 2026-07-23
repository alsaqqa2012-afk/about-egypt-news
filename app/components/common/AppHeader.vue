<template>
  <header class="bg-primary-dark text-white sticky top-0 z-50 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-primary-dark/95">
    <!-- Top bar -->
    <div class="bg-primary-dark/90 py-2 px-4 text-sm">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <span class="meta text-gray-200">{{ currentDate }}</span>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/news"
            class="icon-orange w-10 h-10 rounded-full grid place-items-center hover:bg-white/10 transition"
            title="الأخبار"
            aria-label="News"
          >
            <Icon name="mdi:post-outline" class="w-5 h-5" />
          </NuxtLink>

          <NuxtLink
            to="/category"
            class="icon-orange w-10 h-10 rounded-full grid place-items-center hover:bg-white/10 transition"
            title="الأقسام"
            aria-label="Categories"
          >
            <Icon name="mdi:folder-outline" class="w-5 h-5" />
          </NuxtLink>

          <button
            class="w-10 h-10 rounded-full grid place-items-center hover:bg-white/10 transition md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="فتح القائمة"
          >
            <Icon name="mdi:menu" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main header -->
    <div class="px-4 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <AppLogo />

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-5">
          <NuxtLink :class="navClass('/')" to="/">الرئيسية</NuxtLink>

          <!-- Top Categories (max 4) -->
          <template v-if="!loading && topCategories.length > 0">
            <NuxtLink
              v-for="cat in topCategories"
              :key="cat.id"
              :class="navClass(`/category/${cat.slug}`)"
              :to="`/category/${cat.slug}`"
            >
              {{ cat.name_ar }}
            </NuxtLink>
          </template>

          <!-- Loading Skeleton -->
          <template v-else-if="loading">
            <div class="flex gap-4">
              <div v-for="n in 4" :key="n" class="w-16 h-5 bg-white/10 rounded animate-pulse"></div>
            </div>
          </template>

          <!-- More Dropdown -->
          <div v-if="moreCategories.length > 0" class="relative" ref="dropdownRef">
            <button
              @click="moreOpen = !moreOpen"
              :class="[
                'flex items-center gap-1 hover:text-primary-orange transition font-medium border-b-2 pb-1',
                moreOpen || isMoreActive
                  ? 'text-primary-orange border-primary-orange'
                  : 'border-transparent hover:border-primary-orange',
              ]"
            >
              المزيد
              <Icon
                name="mdi:chevron-down"
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': moreOpen }"
              />
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown">
              <div
                v-if="moreOpen"
                class="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div class="py-2">
                  <NuxtLink
                    v-for="cat in moreCategories"
                    :key="cat.id"
                    :to="`/category/${cat.slug}`"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors group"
                    @click="moreOpen = false"
                  >
                    <div
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: cat.color || '#f97316' }"
                    />
                    <span class="text-gray-700 group-hover:text-orange-600 font-medium text-sm">
                      {{ cat.name_ar }}
                    </span>
                    <span class="mr-auto text-xs text-gray-400">
                      {{ cat.posts_count }}
                    </span>
                  </NuxtLink>
                </div>
                <div class="border-t border-gray-100 py-2">
                  <NuxtLink
                    to="/category"
                    class="flex items-center gap-2 px-4 py-2 text-orange-600 font-medium text-sm hover:bg-orange-50 transition-colors"
                    @click="moreOpen = false"
                  >
                    <Icon name="mdi:view-grid" class="w-4 h-4" />
                    عرض كل الأقسام
                  </NuxtLink>
                </div>
              </div>
            </transition>
          </div>

          <!-- All Categories Link -->
          <NuxtLink
            v-else
            :class="navClass('/category')"
            to="/category"
            class="flex items-center gap-1"
          >
            <Icon name="mdi:view-grid" class="w-4 h-4" />
            الكل
          </NuxtLink>
        </nav>

        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden w-10 h-10 rounded-full grid place-items-center hover:bg-white/10 transition"
          aria-label="فتح القائمة"
        >
          <Icon name="mdi:menu" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-primary-dark border-t border-primary-orange animate-fade-in max-h-[70vh] overflow-y-auto"
      >
        <nav class="flex flex-col p-4 gap-1">
          <NuxtLink to="/" class="mobile-link" @click="closeMenu">الرئيسية</NuxtLink>

          <div class="mt-2 pt-2 border-t border-white/10">
            <p class="px-3 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
              الأقسام
            </p>

            <NuxtLink
              v-for="cat in topCategories"
              :key="cat.id"
              :to="`/category/${cat.slug}`"
              class="mobile-link"
              @click="closeMenu"
            >
              <div
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: cat.color || '#f97316' }"
              />
              {{ cat.name_ar }}
            </NuxtLink>

            <button
              v-if="moreCategories.length > 0"
              @click="showAllMobile = !showAllMobile"
              class="w-full text-right py-2.5 px-3 text-primary-orange text-sm font-medium hover:bg-white/5 rounded-lg transition"
            >
              {{ showAllMobile ? 'إخفاء' : `عرض المزيد (${moreCategories.length})` }}
            </button>

            <template v-if="showAllMobile">
              <NuxtLink
                v-for="cat in moreCategories"
                :key="cat.id"
                :to="`/category/${cat.slug}`"
                class="mobile-link-sub"
                @click="closeMenu"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: cat.color || '#f97316' }"
                />
                {{ cat.name_ar }}
              </NuxtLink>
            </template>
          </div>

          <div class="mt-2 pt-2 border-t border-white/10">
            <NuxtLink to="/category" class="mobile-link-all" @click="closeMenu">
              <Icon name="mdi:view-grid" class="w-4 h-4" />
              كل الأقسام
            </NuxtLink>

            <NuxtLink to="/news" class="mobile-link-blog" @click="closeMenu">
              <Icon name="mdi:post-outline" class="w-4 h-4" />
              الأخبار
            </NuxtLink>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)
const moreOpen = ref(false)
const showAllMobile = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  moreOpen.value = false
})

const { categories, loading, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const MAX_TOP = 4
const topCategories = computed(() => categories.value.slice(0, MAX_TOP))
const moreCategories = computed(() => categories.value.slice(MAX_TOP))

const isMoreActive = computed(() => {
  return moreCategories.value.some(cat => route.path.startsWith(`/category/${cat.slug}`))
})

const closeMenu = () => {
  mobileMenuOpen.value = false
  moreOpen.value = false
}

watch(() => route.fullPath, () => {
  closeMenu()
})

watch(mobileMenuOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

const navClass = (path: string) => {
  const isActive = path === '/'
    ? route.path === '/'
    : route.path.startsWith(path)

  return [
    'hover:text-primary-orange transition font-medium border-b-2 pb-1',
    isActive
      ? 'text-primary-orange border-primary-orange'
      : 'border-transparent hover:border-primary-orange',
  ]
}

const currentDate = computed(() => {
  const date = new Date()
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
})
</script>

<style scoped>
.mobile-link {
  @apply py-2.5 px-3 rounded-lg hover:bg-primary-orange hover:text-primary-dark transition flex items-center gap-2;
}
.mobile-link-sub {
  @apply py-2 px-3 mr-4 rounded-lg hover:bg-white/5 text-gray-300 transition flex items-center gap-2 text-sm;
}
.mobile-link-all {
  @apply py-2.5 px-3 rounded-lg bg-primary-orange/10 text-primary-orange transition flex items-center gap-2 hover:bg-primary-orange hover:text-primary-dark;
}
.mobile-link-blog {
  @apply py-2.5 px-3 rounded-lg bg-white/10 text-white transition flex items-center gap-2 hover:bg-white/20;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.dropdown-enter-active, .dropdown-leave-active {
  transition: all .15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ✅ إصلاح لون أيقونات Top bar */
.icon-orange :deep(svg) {
  width: 1.25rem !important;
  height: 1.25rem !important;
  color: #EA580C !important;
}
</style>