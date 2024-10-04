import { usePathname, useRouter, useSearchParams } from "next/navigation";

import qs from "query-string";

import { Combobox } from "@/components/combox";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";

export function AccountFilter() {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const accountId = params.get("accountId") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const { isLoading: isLoadingFinanceSummary } = useGetFinanceSummary();
  const { data, isLoading: isLoadingAccounts } = useGetAccounts();
  const accountOptions = (data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
    prop: "",
  }));

  accountOptions.unshift({ label: "All accounts", value: "all", prop: "" });

  const onChange = (newValue?: string) => {
    const query = {
      accountId,
      from,
      to,
    };

    if (newValue === "all" || newValue === undefined) {
      query.accountId = "";
    } else {
      query.accountId = newValue;
    }

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  const isLoading = isLoadingFinanceSummary || isLoadingAccounts;

  return (
    <Combobox
      value={accountId}
      options={accountOptions}
      onChange={onChange}
      searchFor="account"
      disabled={isLoading}
    />
  );
}
