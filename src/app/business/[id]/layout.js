import { getBusinessById } from '../../../services/biz';

export async function generateMetadata({ params }) {
  try {
    const business = await getBusinessById(params.id);
    
    if (!business) {
      return {
        title: "עסק לא נמצא",
        description: "העסק המבוקש לא נמצא במערכת.",
      };
    }

    const title = `${business.title || 'עסק'} | מפרגנים`;
    const description = `${business.type || 'עסק'}${business.city ? ` ב${business.city}` : ''}${business.phone ? ` - ${business.phone}` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/business/${params.id}`,
        type: 'website',
        images: ['/mlogo.png'],
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: "עסק | מפרגנים",
      description: "פרטי עסק",
    };
  }
}

export default function BusinessLayout({ children }) {
  return children;
}
