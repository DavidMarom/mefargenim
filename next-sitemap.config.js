/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mefargenim.biz';

module.exports = {
  siteUrl,
  generateRobotsTxt: true,

  changefreq: 'daily',
  priority: 0.7,

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq ?? 'daily',
      priority: config.priority ?? 0.7,
      lastmod: new Date().toISOString(),
    };
  },

  additionalPaths: async () => {
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

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin123', '/api'],
      },
    ],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
};
