"use client";

import { useMemo, useState } from "react";

import { Mail, Phone, Plus, Star } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetVendors } from "@/features/vendors/api/use-get-vendors";
import { TRADE_OPTIONS } from "@/features/vendors/components/vendor-form";
import { useNewVendor } from "@/features/vendors/hooks/use-new-vendor";
import { useOpenVendor } from "@/features/vendors/hooks/use-open-vendor";

type Vendor = {
  id: string;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  rating: number | null;
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  const { onOpen } = useOpenVendor();
  const tradeLabel = TRADE_OPTIONS.find((t) => t.value === vendor.trade)?.label;

  return (
    <button
      onClick={() => onOpen(vendor.id)}
      className="flex flex-col items-start gap-2 rounded-xl border bg-background p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="truncate font-semibold">{vendor.name}</p>
        {vendor.rating != null && (
          <div className="flex shrink-0 items-center gap-0.5 text-xs text-amber-500">
            <Star className="size-3" fill="currentColor" />
            {vendor.rating}
          </div>
        )}
      </div>
      <Badge variant="secondary" className="text-[10px]">
        {tradeLabel}
      </Badge>
      {vendor.phone && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="size-3" />
          {vendor.phone}
        </p>
      )}
      {vendor.email && (
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Mail className="size-3" />
          {vendor.email}
        </p>
      )}
    </button>
  );
}

export default function VendorsView() {
  const { onOpen: openNew } = useNewVendor();
  const { data: vendors, isLoading } = useGetVendors();
  const [tradeFilter, setTradeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!vendors) return [];
    if (tradeFilter === "all") return vendors;
    return vendors.filter((v) => v.trade === tradeFilter);
  }, [vendors, tradeFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select value={tradeFilter} onValueChange={setTradeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            {TRADE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openNew} className="ml-auto shrink-0">
          <Plus className="mr-1 size-4" />
          New vendor
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <span className="text-5xl">🛠️</span>
          <p className="text-sm">
            {vendors?.length
              ? "No vendors match this filter."
              : "No vendors yet. Add a plumber, electrician, or contractor."}
          </p>
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="mr-1 size-4" />
            Add first vendor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </div>
  );
}
