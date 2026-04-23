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
  hideToggle?: boolean;
};

export default function AmountInput({
  value,
  onChange,
  placeholder,
  disabled,
  hideToggle,
}: Props) {
  const parsedValue = parseFloat(value);
  const isIncome = parsedValue > 0;
  const isExpense = parsedValue < 0;

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
              onClick={hideToggle ? undefined : onReverseValue}
              className={cn(
                "absolute left-1.5 top-1.5 flex h-min items-center justify-center rounded-md p-1.5 transition",
                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                isExpense && "bg-rose-500 hover:bg-rose-600",
                hideToggle && "pointer-events-none"
              )}
            >
              {!parsedValue && <Info className="size-4 text-white" />}
              {isIncome && <PlusCircle className="size-4 text-white" />}
              {isExpense && <MinusCircle className="size-4 text-white" />}
            </Button>
          </TooltipTrigger>
          {!hideToggle && (
            <TooltipContent>
              Use [+] to add income or [-] to add expenses.
            </TooltipContent>
          )}
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
        {isIncome && "This will count as income"}
        {isExpense && "This will count as an expense"}
      </p>
    </div>
  );
}
