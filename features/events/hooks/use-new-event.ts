import { create } from "zustand";

type OpenOpts = {
  start?: Date;
  end?: Date;
  title?: string;
  description?: string;
};

type NewEventState = {
  isOpen: boolean;
  defaultStart?: Date;
  defaultEnd?: Date;
  defaultTitle?: string;
  defaultDescription?: string;
  onOpen: (opts?: OpenOpts) => void;
  onClose: () => void;
};

export const useNewEvent = create<NewEventState>((set) => ({
  isOpen: false,
  defaultStart: undefined,
  defaultEnd: undefined,
  defaultTitle: undefined,
  defaultDescription: undefined,
  onOpen: (opts) =>
    set({
      isOpen: true,
      defaultStart: opts?.start,
      defaultEnd: opts?.end,
      defaultTitle: opts?.title,
      defaultDescription: opts?.description,
    }),
  onClose: () =>
    set({
      isOpen: false,
      defaultStart: undefined,
      defaultEnd: undefined,
      defaultTitle: undefined,
      defaultDescription: undefined,
    }),
}));
