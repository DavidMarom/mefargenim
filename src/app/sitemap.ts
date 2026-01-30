import { MetadataRoute } from 'next';
import { getAllBizDocuments } from '../services/biz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mefargenim.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic business pages
  try {
    const businesses = await getAllBizDocuments();
    const businessPages: MetadataRoute.Sitemap = businesses.map((business) => ({
      url: `${baseUrl}/business/${business._id?.toString() || business._id}`,
      lastModified: business.updatedAt || business.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...businessPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
