import { useQuery } from "@tanstack/react-query";

const fetchMyBusiness = async (userId) => {
  const response = await fetch(`/api/biz/my-business?userId=${userId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch business');
  }
  
  return data.data || null;
};

export function useMyBusiness(userId) {
  return useQuery({
    queryKey: ['myBusiness', userId],
    queryFn: () => fetchMyBusiness(userId),
    enabled: !!userId,
  });
}
