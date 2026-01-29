import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({
          user: user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                providerData: user.providerData,
                metadata: {
                  creationTime: user.metadata?.creationTime,
                  lastSignInTime: user.metadata?.lastSignInTime,
                },
              }
            : null,
        });
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // unique name for localStorage key
    }
  )
);
