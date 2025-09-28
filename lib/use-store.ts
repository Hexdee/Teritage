import { STORAGE_KEY } from '@/config/key';
import { MyPersist, StoreState } from '@/type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create<StoreState>(
  (persist as MyPersist)(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      resetUser: () => set({ user: null }),
    }),
    {
      name: STORAGE_KEY,
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useStore;
