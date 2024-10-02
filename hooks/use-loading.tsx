import { create } from "zustand";

type LoadingStore = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useLoading = create<LoadingStore>((set) => ({
  isLoading: false, // Initial state
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
