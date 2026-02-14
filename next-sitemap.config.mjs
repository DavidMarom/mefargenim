/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mefargenim.com';

export default {
  siteUrl,
  generateRobotsTxt: true,

  // Default changefreq/priority for regular pages
  changefreq: 'daily',
  priority: 0.7,

  // Ensure all paths get a lastmod
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq ?? 'daily',
      priority: config.priority ?? 0.7,
      lastmod: new Date().toISOString(),
    };
  },

  // Add dynamic business pages + blog section for Google
  additionalPaths: async (config) => {
    const blogPaths = [
      { loc: '/blog', changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() },
      { loc: '/blog/landing-page', changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() },
      { loc: '/blog/website-presence', changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() },
    ];

    try {
      const { getAllBizDocuments } = await import('./src/services/biz.js');
      const businesses = await getAllBizDocuments();

      const businessPaths = businesses.map((business) => {
        const id = business._id?.toString?.() ?? String(business._id);
        const lastDate = business.updatedAt || business.createdAt || new Date();

        return {
          loc: `/business/${id}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date(lastDate).toISOString(),
        };
      });

      return [...businessPaths, ...blogPaths];
    } catch (error) {
      console.error('Error generating business URLs for sitemap:', error);
      return blogPaths;
    }
  },

  // Mirror your existing robots.ts rules
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin123', '/api'],
      },
    ],
  },
};

