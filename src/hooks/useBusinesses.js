import { useQuery } from "@tanstack/react-query";

const fetchAllBusinesses = async () => {
  const response = await fetch('/api/biz');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch businesses');
  }
  
  return data.data || [];
};

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: fetchAllBusinesses,
  });
}
