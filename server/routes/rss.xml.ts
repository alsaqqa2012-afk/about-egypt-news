export default defineEventHandler((event) => {
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>عن مصر</title>
        <link>https://about-egypt-news.vercel.app</link>
        <description>آخر الأخبار والمقالات</description>
      </channel>
    </rss>`
  
    event.node.res.setHeader('content-type', 'application/xml')
  
    return rss
  })