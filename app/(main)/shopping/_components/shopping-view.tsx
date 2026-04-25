"use client";

import { useState } from "react";

import { InferRequestType, InferResponseType } from "hono";
import { CheckCheck, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetShoppingItems } from "@/features/shopping/api/use-get-shopping-items";
import { useGetShoppingLists } from "@/features/shopping/api/use-get-shopping-lists";
import { useNewShoppingItem } from "@/features/shopping/hooks/use-new-shopping-item";
import { useNewShoppingList } from "@/features/shopping/hooks/use-new-shopping-list";
import { useOpenShoppingItem } from "@/features/shopping/hooks/use-open-shopping-item";
import { useOpenShoppingList } from "@/features/shopping/hooks/use-open-shopping-list";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { client } from "@/lib/hono";
import { cn } from "@/lib/utils";

type Category = "produce" | "dairy" | "meat" | "bakery" | "household" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat",
  bakery: "Bakery",
  household: "Household",
  other: "Other",
};

const CATEGORY_ORDER: Category[] = ["produce", "dairy", "meat", "bakery", "household", "other"];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type PatchRequest = InferRequestType<(typeof client.api["shopping-items"])[":id"]["$patch"]>;
type PatchResponse = InferResponseType<(typeof client.api["shopping-items"])[":id"]["$patch"]>;
type DeleteResponse = InferResponseType<(typeof client.api["shopping-items"])[":id"]["$delete"]>;

function useInlineItemMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
    queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
  };

  const patchMutation = useMutation<PatchResponse, Error, { id: string; json: PatchRequest["json"] }>({
    mutationFn: async ({ id, json }) => {
      const res = await client.api["shopping-items"][":id"].$patch({ param: { id }, json });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: invalidate,
    onError: () => toast.error("Failed to update item"),
  });

  const deleteMutation = useMutation<DeleteResponse, Error, string>({
    mutationFn: async (id) => {
      const res = await client.api["shopping-items"][":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: invalidate,
    onError: () => toast.error("Failed to delete item"),
  });

  return { patchMutation, deleteMutation };
}

export default function ShoppingView() {
  const [activeListId, setActiveListId] = useState<string | undefined>();

  const { onOpen: openNewList } = useNewShoppingList();
  const { onOpen: openNewItem } = useNewShoppingItem();
  const { onOpen: openEditList } = useOpenShoppingList();
  const { onOpen: openEditItem } = useOpenShoppingItem();
  const { onOpen: openNewTransaction } = useNewTransaction();

  const listsQuery = useGetShoppingLists();
  const itemsQuery = useGetShoppingItems(activeListId);
  const { patchMutation, deleteMutation } = useInlineItemMutations();

  const lists = listsQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const activeList = lists.find((l) => l.id === activeListId);

  const toggleCheck = (id: string, currentChecked: boolean) => {
    patchMutation.mutate({ id, json: { checked: !currentChecked } });
  };

  const clearChecked = () => {
    items.filter((i) => i.checked).forEach((i) => deleteMutation.mutate(i.id));
  };

  const checkAll = () => {
    items.filter((i) => !i.checked).forEach((i) => patchMutation.mutate({ id: i.id, json: { checked: true } }));
  };

  const logAsTransaction = () => {
    const total = items
      .filter((i) => i.checked && i.estimatedPrice)
      .reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0);
    openNewTransaction({
      amount: total,
      description: `${activeList?.icon ?? ""} ${activeList?.name ?? "Shopping"}`.trim(),
    });
  };

  const grouped = CATEGORY_ORDER.reduce<Record<Category, typeof items>>(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat);
      return acc;
    },
    { produce: [], dairy: [], meat: [], bakery: [], household: [], other: [] }
  );

  const checkedCount = items.filter((i) => i.checked).length;
  const hasChecked = checkedCount > 0;
  const allUnchecked = items.length > 0 && checkedCount === 0;
  const estimatedTotal = items.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0);
  const checkedTotal = items.filter((i) => i.checked).reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0);

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col gap-1">
        <button
          onClick={() => setActiveListId(undefined)}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
            !activeListId && "bg-muted font-medium"
          )}
        >
          All lists
          <Badge variant="secondary" className="ml-auto text-xs">
            {lists.length}
          </Badge>
        </button>

        <div className="mb-1 mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lists
        </div>

        {listsQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                activeListId === list.id && "bg-muted font-medium"
              )}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-2"
                onClick={() => setActiveListId(list.id)}
              >
                <span className="truncate">
                  {list.icon} {list.name}
                </span>
              </button>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {list.checkedCount}/{list.itemCount}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditList(list.id);
                }}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Pencil className="size-3" />
              </button>
            </div>
          ))
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 justify-start gap-2 text-muted-foreground"
          onClick={openNewList}
        >
          <Plus className="size-4" />
          New list
        </Button>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-base font-semibold">
              {activeList ? `${activeList.icon ?? ""} ${activeList.name}` : "Shopping Lists"}
            </h2>
            {activeListId && (
              <p className="text-xs text-muted-foreground">
                {checkedCount}/{items.length} items
                {estimatedTotal > 0 && ` · ${formatPrice(estimatedTotal)} estimated`}
              </p>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {activeListId && hasChecked && (
              <>
                <Button size="sm" variant="ghost" onClick={logAsTransaction} className="gap-2 text-xs">
                  <Receipt className="size-4" />
                  Log {formatPrice(checkedTotal)}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearChecked}
                  className="gap-2 text-xs text-muted-foreground"
                >
                  <Trash2 className="size-3.5" />
                  Clear checked
                </Button>
              </>
            )}
            {activeListId && allUnchecked && (
              <Button size="sm" variant="ghost" onClick={checkAll} className="gap-2 text-xs text-muted-foreground">
                <CheckCheck className="size-4" />
                Check all
              </Button>
            )}
            {activeListId && (
              <Button size="sm" onClick={() => openNewItem(activeListId)}>
                <Plus className="mr-1 size-4" />
                Add item
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!activeListId ? (
          <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {listsQuery.isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Spinner size="icon" />
              </div>
            ) : lists.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <p className="text-sm">No shopping lists yet.</p>
                <Button size="sm" variant="outline" onClick={openNewList}>
                  <Plus className="mr-1 size-4" />
                  Create first list
                </Button>
              </div>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{list.icon ?? "🛒"}</span>
                    <Badge variant="secondary" className="text-xs">
                      {list.checkedCount}/{list.itemCount}
                    </Badge>
                  </div>
                  <p className="font-medium">{list.name}</p>
                  {list.estimatedTotal > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(list.estimatedTotal)} estimated
                    </p>
                  )}
                  {list.itemCount > 0 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.round((list.checkedCount / list.itemCount) * 100)}%` }}
                      />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        ) : itemsQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="icon" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <p className="text-sm">No items yet.</p>
            <Button size="sm" variant="outline" onClick={() => openNewItem(activeListId)}>
              <Plus className="mr-1 size-4" />
              Add first item
            </Button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0).map((cat) => (
              <div key={cat}>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="space-y-1">
                  {grouped[cat].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5 transition-colors",
                        item.checked && "opacity-60"
                      )}
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleCheck(item.id, item.checked)}
                        className="shrink-0"
                      />
                      <span className={cn("flex-1 text-sm", item.checked && "line-through")}>
                        {item.name}
                        {(item.quantity !== 1 || item.unit) && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {item.quantity}
                            {item.unit ? ` ${item.unit}` : ""}
                          </span>
                        )}
                      </span>
                      {item.estimatedPrice ? (
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(item.estimatedPrice)}
                        </span>
                      ) : null}
                      <button
                        onClick={() => openEditItem(item.id)}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
