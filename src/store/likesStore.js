import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

const useLikesStore = create(
  persist(
    (set, get) => ({
      // Map of businessId -> { liked: boolean, count: number }
      likesData: {},
      // Last fetch timestamp
      lastFetchTime: null,
      // Currently fetching flag
      isFetching: false,

      // Check if we need to fetch (1 hour has passed)
      shouldFetch: () => {
        const { lastFetchTime } = get();
        if (!lastFetchTime) return true;
        const now = Date.now();
        return (now - lastFetchTime) >= ONE_HOUR_MS;
      },

      // Get like status for a specific business (from cache)
      getLikeStatus: (businessId) => {
        const { likesData } = get();
        const businessIdStr = businessId?.toString();
        return likesData[businessIdStr] || { liked: false, count: 0 };
      },

      // Fetch all likes for a user (only if 1 hour has passed)
      fetchLikes: async (userId) => {
        const { shouldFetch, isFetching } = get();
        
        // Don't fetch if already fetching or if cache is still valid
        if (isFetching || !shouldFetch()) {
          return;
        }

        set({ isFetching: true });

        try {
          // Fetch all businesses to get their IDs
          const businessesResponse = await fetch('/api/biz');
          const businessesData = await businessesResponse.json();

          if (!businessesData.success || !businessesData.data) {
            throw new Error('Failed to fetch businesses');
          }

          const businesses = businessesData.data;
          const likesDataMap = {};

          // Fetch like status for each business
          const likePromises = businesses.map(async (business) => {
            const businessId = business._id?.toString() || business._id;
            try {
              const response = await fetch(
                `/api/likes?userId=${userId}&businessId=${businessId}`
              );
              const data = await response.json();
              
              if (data.success) {
                likesDataMap[businessId] = {
                  liked: data.liked || false,
                  count: data.count || 0,
                };
              }
            } catch (error) {
              console.error(`Error fetching like for business ${businessId}:`, error);
              // Set default values on error
              likesDataMap[businessId] = {
                liked: false,
                count: 0,
              };
            }
          });

          await Promise.all(likePromises);

          set({
            likesData: likesDataMap,
            lastFetchTime: Date.now(),
            isFetching: false,
          });
        } catch (error) {
          console.error('Error fetching likes:', error);
          set({ isFetching: false });
        }
      },

      // Update like status for a specific business (after toggle)
      updateLikeStatus: (businessId, liked, count) => {
        const { likesData } = get();
        const businessIdStr = businessId?.toString();
        
        set({
          likesData: {
            ...likesData,
            [businessIdStr]: {
              liked,
              count: count || 0,
            },
          },
        });
      },

      // Clear likes data (useful for logout)
      clearLikes: () => {
        set({
          likesData: {},
          lastFetchTime: null,
        });
      },
    }),
    {
      name: 'likes-storage', // localStorage key
    }
  )
);

export default useLikesStore;
