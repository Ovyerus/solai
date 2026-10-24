import type { APIRoute } from 'astro';

const pages = ['/', '/palette/', '/guide/', '/downloads/'];

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n')}\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
