import { create } from "zustand";

type State = {
  isOpen: boolean;
  defaultListId?: string;
  defaultStatus?: "todo" | "in_progress" | "done";
  onOpen: (listId?: string, status?: "todo" | "in_progress" | "done") => void;
  onClose: () => void;
};

export const useNewTask = create<State>((set) => ({
  isOpen: false,
  defaultListId: undefined,
  defaultStatus: undefined,
  onOpen: (defaultListId, defaultStatus) =>
    set({ isOpen: true, defaultListId, defaultStatus }),
  onClose: () =>
    set({ isOpen: false, defaultListId: undefined, defaultStatus: undefined }),
}));
