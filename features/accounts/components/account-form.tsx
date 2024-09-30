import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AccountNumberInput } from "@/components/account-number-input";
import BalanceInput from "@/components/balance-input";
import { SvgCombobox } from "@/components/svg-combo-box";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertAccountSchema } from "@/db/schema";
import { convertAmountToMiliunits } from "@/lib/utils";

const formSchema = z.object({
  name: z.string(),
  holder: z.string(),
  number: z.string().refine((val) => {
    const cleanedVal = val.replace(/\s+/g, "");
    return /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{6}\d{11}$/.test(cleanedVal);
  }, "Invalid IBAN format. Please ensure the correct format: GB00 0000 0000 0000 0000 0000 0"),
  balance: z.string(),
  bankIcon: z.string().nullable().optional(),
});

const apiSchema = insertAccountSchema.omit({
  id: true,
  userId: true,
  orgId: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.output<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function AccountForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    const balance = parseFloat(values.balance);
    const balanceInMiliunits = convertAmountToMiliunits(balance);

    onSubmit({
      ...values,
      balance: balanceInMiliunits,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a name"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="holder"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Holder</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a holder"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="number"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number</FormLabel>
              <FormControl>
                <AccountNumberInput
                  {...field}
                  placeholder="xxxx xxxx xxxx xxxx xxxx xxxx x"
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="bankIcon"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Provider</FormLabel>
              <FormControl>
                <SvgCombobox
                  value={field.value}
                  onChange={field.onChange}
                  searchFor="bank account provider"
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="balance"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance</FormLabel>
              <FormControl>
                <BalanceInput
                  {...field}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create account"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            size="icon"
            variant="outline"
          >
            <Trash className="mr-2 size-4" />
            Delete account
          </Button>
        )}
      </form>
    </Form>
  );
}
