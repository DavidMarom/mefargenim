import { useQuery } from "@tanstack/react-query";

const fetchBusiness = async (id) => {
  const response = await fetch(`/api/biz/${id}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch business');
  }
  
  return data.data;
};

export function useBusiness(id) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => fetchBusiness(id),
    enabled: !!id,
  });
}
