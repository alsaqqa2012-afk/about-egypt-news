<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="flex items-center gap-2 mb-8">
      <div class="w-1 h-8 bg-primary-orange rounded" />
      <h1 class="text-2xl md:text-3xl font-bold text-primary-dark">اتصل بنا</h1>
    </div>

    <p class="text-gray-600 mb-8 leading-relaxed">
      يسعدنا تواصلك معنا لأي استفسارات أو اقتراحات أو ملاحظات حول محتوى الموقع.
      يمكنك ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن.
    </p>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div>
        <label class="block mb-2 font-bold text-primary-dark">الاسم</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
        >
      </div>

      <div>
        <label class="block mb-2 font-bold text-primary-dark">البريد الإلكتروني</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
        >
      </div>

      <div>
        <label class="block mb-2 font-bold text-primary-dark">الموضوع</label>
        <input
          v-model="form.subject"
          type="text"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
        >
      </div>

      <div>
        <label class="block mb-2 font-bold text-primary-dark">الرسالة</label>
        <textarea
          v-model="form.message"
          rows="6"
          required
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
        />
      </div>

      <button
        type="submit"
        :disabled="submitting"
         class="px-8 py-3 bg-primary-orange text-white font-bold rounded-lg hover:bg-primary-dark hover:text-white transition-colors disabled:opacity-50"      >
        {{ submitting ? 'جارٍ الإرسال...' : 'إرسال الرسالة' }}
      </button>

      <p v-if="submitted" class="text-green-600 font-bold">
        تم إرسال رسالتك بنجاح، شكرًا لتواصلك معنا.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitting = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    // عدّل هذا المسار ليطابق الـ API الفعلي لديك
    await $fetch('/api/contact', {
      method: 'POST',
      body: form.value,
    })
    submitted.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch (error) {
    console.error('حدث خطأ أثناء إرسال الرسالة:', error)
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'اتصل بنا - عن مصر',
  meta: [
    { name: 'description', content: 'تواصل معنا عبر نموذج الاتصال لأي استفسارات أو ملاحظات.' },
  ],
})
</script>