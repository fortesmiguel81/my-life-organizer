// src/components/LoadingIndicator.tsx
import { useLoading } from "@/hooks/use-loading";

import Spinner from "./spinner";

const LoadingIndicator = () => {
  const { isLoading } = useLoading();

  return isLoading ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="flex flex-col items-center justify-center">
        <Spinner size="giant" />
        {/* <span className="mt-2 text-3xl font-semibold">
          Changing Accounts...
        </span> */}
      </div>
    </div>
  ) : null;
};

export default LoadingIndicator;
