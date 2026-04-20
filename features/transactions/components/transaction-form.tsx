"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, MinusCircle, PlusCircle, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AmountInput from "@/components/amount-input";
import DatePicker from "@/components/date-picker";
import Select from "@/components/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { convertAmountToMiliunits } from "@/lib/utils";

const formSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.string().refine((val) => {
      const n = parseFloat(val);
      return !isNaN(n) && n !== 0;
    }, "Amount must be a non-zero number"),
    payee: z.string().min(1, "Payee is required"),
    description: z.string(),
    date: z.coerce.date(),
    accountId: z.string().min(1, "Account is required"),
    toAccountId: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    recurrence: z.enum(["none", "daily", "weekly", "biweekly", "monthly", "yearly"]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Destination account is required for transfers",
        path: ["toAccountId"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export type TransactionFormSubmitValues = {
  amount: number;
  payee: string;
  description: string;
  date: Date;
  accountId: string;
  toAccountId?: string;
  categoryId?: string | null;
  type: "income" | "expense" | "transfer";
  recurrence: "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  nextDueDate?: Date | null;
};

type Props = {
  id?: string;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: TransactionFormSubmitValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: { label: string; value: string; prop: string }[];
  onCreateAccount: (name: string) => void;
  categoryOptions: { label: string; value: string; prop: string }[];
  onCreateCategory: (name: string) => void;
};

const TYPE_OPTIONS = [
  { value: "expense", label: "Expense", icon: MinusCircle, className: "text-rose-500" },
  { value: "income", label: "Income", icon: PlusCircle, className: "text-emerald-500" },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight, className: "text-blue-500" },
] as const;

const RECURRENCE_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export default function TransactionForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  onCreateAccount,
  categoryOptions,
  onCreateCategory,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      payee: "",
      description: "",
      date: new Date(),
      accountId: "",
      toAccountId: undefined,
      categoryId: null,
      recurrence: "none",
      ...defaultValues,
    },
  });

  const transactionType = form.watch("type");

  const handleTypeChange = (newType: "income" | "expense" | "transfer") => {
    form.setValue("type", newType);
    // Flip sign when switching between income and expense
    const currentAmount = form.getValues("amount");
    if (currentAmount) {
      const n = parseFloat(currentAmount);
      if (!isNaN(n)) {
        if (newType === "income" && n < 0) form.setValue("amount", String(-n));
        if (newType === "expense" && n > 0) form.setValue("amount", String(-n));
        if (newType === "transfer") form.setValue("amount", String(Math.abs(n)));
      }
    }
    if (newType === "transfer") {
      form.setValue("categoryId", null);
    }
  };

  const handleSubmit = (values: FormValues) => {
    const rawAmount = parseFloat(values.amount);
    let finalAmount: number;

    if (values.type === "income") {
      finalAmount = convertAmountToMiliunits(Math.abs(rawAmount));
    } else if (values.type === "expense") {
      finalAmount = convertAmountToMiliunits(-Math.abs(rawAmount));
    } else {
      // Transfer: API handles sign direction
      finalAmount = convertAmountToMiliunits(Math.abs(rawAmount));
    }

    onSubmit({
      amount: finalAmount,
      payee: values.payee,
      description: values.description,
      date: values.date,
      accountId: values.accountId,
      toAccountId: values.toAccountId,
      categoryId: values.type === "transfer" ? null : (values.categoryId ?? null),
      type: values.type,
      recurrence: values.recurrence,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        {/* Type selector */}
        <div className="flex rounded-lg border p-1 gap-1">
          {TYPE_OPTIONS.map(({ value, label, icon: Icon, className }) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => handleTypeChange(value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                transactionType === value
                  ? "bg-muted shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${transactionType === value ? className : ""}`} />
              {label}
            </button>
          ))}
        </div>

        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {transactionType === "transfer" ? "From Account" : "Account"}
              </FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {transactionType === "transfer" && (
          <FormField
            name="toAccountId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Account</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Select destination account"
                    options={accountOptions.filter(
                      (a) => a.value !== form.getValues("accountId")
                    )}
                    onCreate={onCreateAccount}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {transactionType !== "transfer" && (
          <FormField
            name="categoryId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Select a category (optional)"
                    options={categoryOptions}
                    onCreate={onCreateCategory}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Optional description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {transactionType !== "transfer" && (
          <FormField
            name="recurrence"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat</FormLabel>
                <UiSelect
                  disabled={disabled}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No repeat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create transaction"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="mr-2 size-4" />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
}
