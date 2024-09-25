import { useMountedState } from "react-use";

import NewTransactionSheet from "@/features/transactions/components/new-transaction-sheet";

export default function SheetProvider() {
  const isMounted = useMountedState();

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewTransactionSheet />
    </>
  );
}
