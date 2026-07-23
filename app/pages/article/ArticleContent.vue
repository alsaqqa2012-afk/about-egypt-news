<template>
  <section class="prose prose-lg max-w-none prose-headings:text-primary-dark prose-p:leading-8 prose-p:text-slate-700">
    <p
      v-for="(paragraph, index) in content"
      :key="index"
      class="mb-5"
    >
      {{ paragraph }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  content: string[]
}>()
</script>
