import { create } from 'zustand';

type SettingsStore = {
  isOpen: boolean;
  OnOpen: () => void;
  OnClose: () => void;
};

export const useSettings = create<SettingsStore>((set, get) => ({
  isOpen: false,
  OnOpen: () => set({ isOpen: true }),
  OnClose: () => set({ isOpen: false }),
}));
