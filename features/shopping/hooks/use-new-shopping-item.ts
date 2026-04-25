import { create } from "zustand";

type State = {
  isOpen: boolean;
  defaultListId?: string;
  onOpen: (listId?: string) => void;
  onClose: () => void;
};

export const useNewShoppingItem = create<State>((set) => ({
  isOpen: false,
  onOpen: (defaultListId) => set({ isOpen: true, defaultListId }),
  onClose: () => set({ isOpen: false, defaultListId: undefined }),
}));
