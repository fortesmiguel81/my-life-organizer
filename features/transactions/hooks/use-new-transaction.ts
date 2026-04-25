import { create } from "zustand";

type NewTransactionState = {
  isOpen: boolean;
  defaultAmount?: number;
  defaultDescription?: string;
  onOpen: (opts?: { amount?: number; description?: string }) => void;
  onClose: () => void;
};

export const useNewTransaction = create<NewTransactionState>((set) => ({
  isOpen: false,
  onOpen: (opts) => set({ isOpen: true, defaultAmount: opts?.amount, defaultDescription: opts?.description }),
  onClose: () => set({ isOpen: false, defaultAmount: undefined, defaultDescription: undefined }),
}));
