import { InferResponseType } from "hono";
import { Building2, CreditCard } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { client } from "@/lib/hono";
import { formatCurrency } from "@/lib/utils";

type AccountsResponseType = InferResponseType<
  typeof client.api.accounts.$get,
  200
>["data"][0];

type Props = {
  account: AccountsResponseType;
};

export default function AccountCard({ account }: Props) {
  const { onOpen } = useOpenAccount();
  return (
    <Card
      className="hover:cursor-pointer hover:bg-muted/50"
      onClick={() => onOpen(account.id)}
    >
      <CardHeader className="relative pb-2">
        <div className="absolute right-4 top-4">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{account.holder}</CardTitle>
        <CardDescription>{account.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Current Balance
            </span>
            <div className="flex items-center">
              <span className="text-3xl font-bold">
                {formatCurrency(account.balance)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Account Number
            </span>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{account.number}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
