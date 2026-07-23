<template>
  <NuxtLink to="/" class="flex items-center gap-3 group transition-transform hover:scale-105">
    <!-- مكان الصورة -->
    <div class="relative w-12 h-12 flex items-center justify-center">
      <img 
        src="/logo.png" 
        alt="شعار عن مصر" 
        class="w-full h-full object-contain"
      />
    </div>
    
    <!-- اسم الموقع (اختياري إذا كان الاسم جزءاً من الصورة يمكنك حذف هذا الجزء) -->
    <div class="flex flex-col">
      <span class="text-2xl font-bold font-display tracking-wide leading-none text-white">
        عن <span class="text-primary-orange">مصر</span>
      </span>
      <span class="text-[10px] text-gray-400 font-medium tracking-tighter mt-1">
        بوابتك للأخبار والخدمات
      </span>
    </div>
  </NuxtLink>
</template>
