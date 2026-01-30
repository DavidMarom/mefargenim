import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveBusiness = async ({ userId, businessData }) => {
  const response = await fetch('/api/biz/my-business', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      businessData,
    }),
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to save business');
  }
  
  return data.data;
};

const deleteBusiness = async (userId) => {
  const response = await fetch(`/api/biz/my-business?userId=${userId}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete business');
  }
  
  return data;
};

export function useSaveBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saveBusiness,
    onSuccess: (data, variables) => {
      // Invalidate and refetch my business query
      queryClient.invalidateQueries({ queryKey: ['myBusiness', variables.userId] });
      // Also invalidate all businesses to refresh the list
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: (data, userId) => {
      // Invalidate and refetch my business query
      queryClient.invalidateQueries({ queryKey: ['myBusiness', userId] });
      // Also invalidate all businesses to refresh the list
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}
