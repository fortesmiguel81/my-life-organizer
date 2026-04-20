import { create } from "zustand";

type NewEventState = {
  isOpen: boolean;
  defaultStart?: Date;
  defaultEnd?: Date;
  onOpen: (start?: Date, end?: Date) => void;
  onClose: () => void;
};

export const useNewEvent = create<NewEventState>((set) => ({
  isOpen: false,
  defaultStart: undefined,
  defaultEnd: undefined,
  onOpen: (start, end) =>
    set({ isOpen: true, defaultStart: start, defaultEnd: end }),
  onClose: () =>
    set({ isOpen: false, defaultStart: undefined, defaultEnd: undefined }),
}));
