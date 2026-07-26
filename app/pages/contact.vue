<script setup lang="ts">
// ============================================================
// صفحة اتصل بنا - Contact Us (SEO Optimized)
// ✅ SEO كامل (OG + Twitter + JSON-LD + Canonical)
// ✅ Accessibility: label for/id
// ✅ UX: رسالة خطأ عند فشل الإرسال
// ============================================================

// --- Config ---
const config  = useRuntimeConfig()
const SITE_URL = config.public.siteUrl as string

// --- Form State ---
const form = ref({
  name:    '',
  email:   '',
  subject: '',
  message: '',
})

const submitting = ref(false)
const submitted  = ref(false)
const submitError = ref<string | null>(null) // ✅ مضاف

async function handleSubmit() {
  submitting.value  = true
  submitted.value   = false
  submitError.value = null

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form.value,
    })
    submitted.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch (error) {
    // ✅ رسالة خطأ واضحة للمستخدم بدل console.error فقط
    submitError.value = 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.'
    console.error('Contact form error:', error)
  } finally {
    submitting.value = false
  }
}

// --- SEO ---
const canonicalUrl = `${SITE_URL}/contact`

useHead({
  htmlAttrs: { lang: 'ar', dir: 'rtl' }, // ✅ مضاف
  title: 'اتصل بنا - عن مصر',
  meta: [
    { name: 'description', content: 'تواصل معنا عبر نموذج الاتصال لأي استفسارات أو ملاحظات حول محتوى موقع عن مصر.' },
    { name: 'robots',      content: 'index, follow' }, // ✅ مضاف

    // ✅ Open Graph - كانت مفقودة كلياً
    { property: 'og:type',         content: 'website' },
    { property: 'og:title',        content: 'اتصل بنا - عن مصر' },
    { property: 'og:description',  content: 'تواصل معنا عبر نموذج الاتصال لأي استفسارات أو ملاحظات حول محتوى موقع عن مصر.' },
    { property: 'og:url',          content: canonicalUrl },
    { property: 'og:locale',       content: 'ar_EG' },
    { property: 'og:image',        content: `${SITE_URL}/og-default.jpg` },
    { property: 'og:image:width',  content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt',    content: 'اتصل بنا - عن مصر' },

    // ✅ Twitter Card - كانت مفقودة كلياً
    { name: 'twitter:card',        content: 'summary_large_image' },
    { name: 'twitter:title',       content: 'اتصل بنا - عن مصر' },
    { name: 'twitter:description', content: 'تواصل معنا عبر نموذج الاتصال لأي استفسارات أو ملاحظات حول محتوى موقع عن مصر.' },
    { name: 'twitter:image',       content: `${SITE_URL}/og-default.jpg` },
    { name: 'twitter:image:alt',   content: 'اتصل بنا - عن مصر' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl }, // ✅ مضاف
  ],
  script: [
    // ✅ ContactPage Schema - مضافة من الصفر
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: 'اتصل بنا - عن مصر',
        description: 'تواصل معنا عبر نموذج الاتصال لأي استفسارات أو ملاحظات.',
        inLanguage: 'ar-EG',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'عن مصر',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': `${SITE_URL}/#organization`,
          name: 'عن مصر',
        },
      }),
    },
    // ✅ BreadcrumbList - مضافة من الصفر
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'اتصل بنا', item: canonicalUrl },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-light-bg">
    <div class="max-w-3xl mx-auto px-4 py-12">

      <!-- ✅ Breadcrumb - متطابق مع JSON-LD -->
      <nav class="flex items-center gap-2 text-sm text-muted mb-6" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary-orange transition-colors">الرئيسية</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span class="text-body">اتصل بنا</span>
      </nav>

      <!-- Header -->
      <div class="flex items-center gap-2 mb-8">
        <div class="w-1 h-8 bg-primary-orange rounded" aria-hidden="true" />
        <h1 class="text-2xl md:text-3xl font-bold text-primary-dark">اتصل بنا</h1>
      </div>

      <p class="text-gray-600 mb-8 leading-relaxed">
        يسعدنا تواصلك معنا لأي استفسارات أو اقتراحات أو ملاحظات حول محتوى الموقع.
        يمكنك ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن.
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit" novalidate>

        <!-- الاسم -->
        <div>
          <label for="contact-name" class="block mb-2 font-bold text-primary-dark">
            الاسم <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            required
            autocomplete="name"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
          />
        </div>

        <!-- البريد الإلكتروني -->
        <div>
          <label for="contact-email" class="block mb-2 font-bold text-primary-dark">
            البريد الإلكتروني <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
          />
        </div>

        <!-- الموضوع -->
        <div>
          <label for="contact-subject" class="block mb-2 font-bold text-primary-dark">
            الموضوع <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-subject"
            v-model="form.subject"
            type="text"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
          />
        </div>

        <!-- الرسالة -->
        <div>
          <label for="contact-message" class="block mb-2 font-bold text-primary-dark">
            الرسالة <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            v-model="form.message"
            rows="6"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-orange"
          />
        </div>

        <!-- زر الإرسال -->
        <button
          type="submit"
          :disabled="submitting"
          class="px-8 py-3 bg-primary-orange text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'جارٍ الإرسال...' : 'إرسال الرسالة' }}
        </button>

        <!-- ✅ رسالة نجاح -->
        <p
          v-if="submitted"
          role="status"
          aria-live="polite"
          class="text-green-600 font-bold"
        >
          ✅ تم إرسال رسالتك بنجاح، شكرًا لتواصلك معنا.
        </p>

        <!-- ✅ رسالة خطأ - كانت مفقودة -->
        <p
          v-if="submitError"
          role="alert"
          aria-live="assertive"
          class="text-red-600 font-bold"
        >
          ⚠️ {{ submitError }}
        </p>

      </form>
    </div>
  </div>
</template>