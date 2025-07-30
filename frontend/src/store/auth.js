import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      allUserData: null,
      access_token: null,
      rehydrated: false,

      user: () => ({
        user_id: get().allUserData?.user_id || null,
        username: get().allUserData?.username || null,
        email: get().allUserData?.email || null,
        full_name: get().allUserData?.full_name || null,
      }),

      setUser: (user, token = null) => {
        const update = { allUserData: user };
        if (token) update.access_token = token;
        set(update);
      },

      isLoggedIn: () => get().allUserData !== null,
      logout: () => set({ allUserData: null, access_token: null }),

      setRehydrated: () => set({ rehydrated: true }),

      // 🆕 Role kontrol fonksiyonları
      hasBaseRole: (role) => {
        return get().allUserData?.base_roles?.includes(role) || false;
      },
      hasSubRole: (role) => {
        return get().allUserData?.sub_roles?.includes(role) || false;
      },
      hasAnySubRole: (roles) => {
        const subRoles = get().allUserData?.sub_roles || [];
        return roles.some((r) => subRoles.includes(r));
      },

      // 🆕 setRoleData metodu
      setRoleData: (roleData) => {
        const current = get().allUserData || {};
        set({
          allUserData: {
            ...current,
            base_roles: roleData.base_roles || [],
            sub_roles: roleData.sub_roles || [],
          },
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        allUserData: state.allUserData,
        access_token: state.access_token,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn("Zustand rehydrate hatası:", error);
        else state.setRehydrated?.();
      },
    }
  )
);
