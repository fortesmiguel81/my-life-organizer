import { Info, MinusCircle, PlusCircle } from "lucide-react";
import CurrencyInput from "react-currency-input-field";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function BalanceInput({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) {
  const parsedValue = parseFloat(value);
  const isPositive = parsedValue > 0;
  const isNegative = parsedValue < 0;

  const onReverseValue = () => {
    if (!value) return;

    const newValue = parseFloat(value) * -1;
    onChange(newValue.toString());
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={onReverseValue}
              className={cn(
                "absolute left-1.5 top-1.5 flex h-min items-center justify-center rounded-md p-1.5 transition",
                isPositive && "bg-emerald-500 hover:bg-emerald-600",
                isNegative && "bg-rose-500 hover:bg-rose-600"
              )}
            >
              {!parsedValue && <Info className="size-4 text-white" />}
              {isPositive && <PlusCircle className="size-4 text-white" />}
              {isNegative && <MinusCircle className="size-4 text-white" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Use [+] to add a positive balance or [-] to add a negative balance.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        prefix="€"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        placeholder={placeholder}
        value={value}
        decimalsLimit={2}
        decimalScale={2}
        onValueChange={onChange}
        disabled={disabled}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {isPositive && "The account will be created with a positive balance"}
        {isNegative && "The account will be created with a negative balance"}
      </p>
    </div>
  );
}
