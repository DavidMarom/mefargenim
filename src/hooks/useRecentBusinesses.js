import { useQuery } from "@tanstack/react-query";

const fetchRecentBusinesses = async (limit = 3) => {
  const response = await fetch(`/api/biz/recent?limit=${limit}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch recent businesses');
  }
  
  return data.data || [];
};

export function useRecentBusinesses(limit = 3) {
  return useQuery({
    queryKey: ['recentBusinesses', limit],
    queryFn: () => fetchRecentBusinesses(limit),
  });
}
