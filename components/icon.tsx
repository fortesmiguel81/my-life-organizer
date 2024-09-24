import dynamic from "next/dynamic";
import { useMemo } from "react";

import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface IconProps extends LucideProps {
  name: string;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = useMemo(
    () => dynamic(dynamicIconImports[name as keyof typeof dynamicIconImports]),
    [name]
  );

  return <LucideIcon {...props} />;
};

export default Icon;
