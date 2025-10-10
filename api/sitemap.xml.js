/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

/**
 * Dynamic sitemap generator
 */
export default async function handler(req, res) {
  // Set headers for XML content
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  
  const baseUrl = 'https://collectiveai.tools';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/job-board', priority: '0.9', changefreq: 'hourly' },
    { url: '/ai-workspace', priority: '0.8', changefreq: 'weekly' },
    { url: '/ai-workspace/workflow-builder', priority: '0.7', changefreq: 'weekly' },
    { url: '/ai-workspace/ai-agent-creator', priority: '0.7', changefreq: 'weekly' },
    { url: '/ai-workspace/code-analyzer', priority: '0.7', changefreq: 'weekly' },
    { url: '/ai-workspace/workflow-analyzer', priority: '0.7', changefreq: 'weekly' },
    { url: '/ai-workspace/data-fusion', priority: '0.7', changefreq: 'weekly' },
    { url: '/built-in-tools', priority: '0.6', changefreq: 'weekly' }
  ];
  
  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.url}"/>
  </url>`).join('\n')}
</urlset>`;

  res.status(200).send(sitemap);
}
