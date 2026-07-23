export default defineEventHandler((event) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://about-egypt-news.vercel.app/</loc>
      </url>
      <url>
        <loc>https://about-egypt-news.vercel.app/news</loc>
      </url>
      <url>
        <loc>https://about-egypt-news.vercel.app/about</loc>
      </url>
    </urlset>`
  
    event.node.res.setHeader('content-type', 'application/xml')
  
    return sitemap
  })