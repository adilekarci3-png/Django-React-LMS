// src/store/auth.js
import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

const initialState = {
  allUserData: null,     // { user_id, username, email, full_name, base_roles, sub_roles, ... }
  access_token: null,
  rehydrated: false,
};

export const useAuthStore = createWithEqualityFn(
  persist(
    (set, get) => ({
      ...initialState,

      // Türetilmiş kullanıcı bilgisi (okuma kolaylığı için)
      user: () => {
        const u = get().allUserData || {};
        return {
          user_id: u.user_id ?? null,
          username: u.username ?? null,
          email: u.email ?? null,
          full_name: u.full_name ?? null,
        };
      },

      // Kullanıcı ve/veya token set et
      setUser: (user, token = null) => {
        const update = { allUserData: user ?? null };
        if (token !== null) update.access_token = token;
        set(update);
      },

      // Basit login durumu (fonksiyon → her yerde isLoggedIn() diye çağır)
      isLoggedIn: () => get().allUserData !== null,

      // Çıkış
      logout: () => set({ allUserData: null, access_token: null }),

      // Rehydrate tamam
      setRehydrated: () => set({ rehydrated: true }),

      // ---- Rol yardımcıları ----
      hasBaseRole: (role) => {
        const roles = get().allUserData?.base_roles || [];
        return roles.includes(role);
      },
      hasSubRole: (role) => {
        const roles = get().allUserData?.sub_roles || [];
        return roles.includes(role);
      },
      hasAnySubRole: (roles) => {
        const subRoles = get().allUserData?.sub_roles || [];
        return roles?.some((r) => subRoles.includes(r)) || false;
      },

      // Role bilgilerini güncelle (mevcut user üstüne yazar)
      setRoleData: (roleData) => {
        const current = get().allUserData || {};
        set({
          allUserData: {
            ...current,
            base_roles: roleData?.base_roles || [],
            sub_roles: roleData?.sub_roles || [],
          },
        });
      },

      // (Opsiyonel) Tam sıfırlama
      reset: () => set({ ...initialState, rehydrated: true }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        allUserData: state.allUserData,
        access_token: state.access_token,
        // rehydrated bilinçli olarak persist edilmiyor
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Zustand rehydrate hatası:", error);
          return;
        }
        state?.setRehydrated?.();
      },
      version: 1,
    }
  )
);
