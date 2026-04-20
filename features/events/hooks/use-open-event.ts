import { create } from "zustand";

type OpenEventState = {
  id?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenEvent = create<OpenEventState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}));
