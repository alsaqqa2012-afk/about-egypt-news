// server/routes/news-sitemap.xml.ts
// ============================================================
// Proxy لـ news-sitemap.xml من الباك اند (Django) إلى دومين الفرونت اند
// ============================================================
// ✅ Google News محتاج الـ sitemap يكون على نفس دومين المحتوى نفسه
//    (about-egypt-news.vercel.app) مش على دومين الـ API (89.167.10.171.nip.io).
//    هذا الملف بيخلي /news-sitemap.xml شغال على دومين الموقع مباشرة،
//    وبيجيب المحتوى فعليًا من Django في الخلفية من غير ما المستخدم/جوجل يحس.
//
// مكان الملف مهم: Nitro (محرك Nuxt) بيسجل أي ملف تحت server/routes/
// تلقائيًا كـ route بنفس اسم الملف. يعني هذا الملف بيشتغل على:
//   https://about-egypt-news.vercel.app/news-sitemap.xml
// ============================================================

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiBase = (config.public.apiBase as string).replace(/\/$/, '')
  
    try {
      // ✅ بنجيب الـ XML كنص خام (مش JSON) من الباك اند
      const xml = await $fetch<string>(`${apiBase}/news-sitemap.xml`, {
        responseType: 'text',
        headers: { Accept: 'application/xml' },
      })
  
      setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  
      // ✅ Cache قصير نسبيًا (5 دقايق) لأن المحتوى بيتغير باستمرار:
      // مقالات جديدة بتدخل، ومقالات أقدم من 48 ساعة بتخرج من النافذة تلقائيًا.
      // s-maxage بيتحكم في الـ CDN (Vercel Edge)، max-age بيتحكم في متصفح الزائر.
      setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  
      return xml
    } catch (error) {
      // ✅ لو الباك اند واقع أو مش راد، منرجعش خطأ 500 يكسر الزحف —
      // نرجع sitemap فاضي وصحيح تركيبيًا بدل ما نرجع صفحة خطأ مش XML خالص
      setResponseStatus(event, 200)
      setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
      return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"></urlset>'
    }
  })