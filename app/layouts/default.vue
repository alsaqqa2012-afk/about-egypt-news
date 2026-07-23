@'
<template>
  <div class="bg-light-bg min-h-screen flex flex-col">
    <CommonAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <CommonAppFooter />
  </div>
</template>

<script setup lang="ts">
// This layout wraps all pages by default
</script>
'@ | Set-Content -Path app\layouts\default.vue -Encoding UTF8