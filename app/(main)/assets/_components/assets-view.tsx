"use client";

import { useMemo, useState } from "react";

import { FileText, MapPin, Plus, ShieldAlert } from "lucide-react";

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
import { useGetAssets } from "@/features/assets/api/use-get-assets";
import { CATEGORY_OPTIONS } from "@/features/assets/components/asset-form";
import { useNewAsset } from "@/features/assets/hooks/use-new-asset";
import { useOpenAsset } from "@/features/assets/hooks/use-open-asset";

type Asset = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  location: string | null;
  warrantyExpiration: string | Date | null;
  manualDocumentId: string | null;
};

function isWarrantyExpiringSoon(date: string | Date | null) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return d >= now && d <= in30Days;
}

function isWarrantyExpired(date: string | Date | null) {
  if (!date) return false;
  return new Date(date) < new Date();
}

function AssetCard({ asset }: { asset: Asset }) {
  const { onOpen } = useOpenAsset();
  const categoryLabel = CATEGORY_OPTIONS.find(
    (c) => c.value === asset.category
  )?.label;
  const expiringSoon = isWarrantyExpiringSoon(asset.warrantyExpiration);
  const expired = isWarrantyExpired(asset.warrantyExpiration);

  return (
    <button
      onClick={() => onOpen(asset.id)}
      className="flex flex-col items-start gap-2 rounded-xl border bg-background p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="truncate font-semibold">{asset.name}</p>
        {asset.manualDocumentId && (
          <FileText className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-[10px]">
          {categoryLabel}
        </Badge>
        {expired && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <ShieldAlert className="size-3" />
            Warranty expired
          </Badge>
        )}
        {!expired && expiringSoon && (
          <Badge className="gap-1 bg-amber-500 text-[10px] hover:bg-amber-500">
            <ShieldAlert className="size-3" />
            Warranty expiring soon
          </Badge>
        )}
      </div>
      {(asset.brand || asset.model) && (
        <p className="text-xs text-muted-foreground">
          {[asset.brand, asset.model].filter(Boolean).join(" · ")}
        </p>
      )}
      {asset.location && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {asset.location}
        </p>
      )}
    </button>
  );
}

export default function AssetsView() {
  const { onOpen: openNew } = useNewAsset();
  const { data: assets, isLoading } = useGetAssets();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!assets) return [];
    if (categoryFilter === "all") return assets;
    return assets.filter((a) => a.category === categoryFilter);
  }, [assets, categoryFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openNew} className="ml-auto shrink-0">
          <Plus className="mr-1 size-4" />
          New asset
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <span className="text-5xl">📦</span>
          <p className="text-sm">
            {assets?.length
              ? "No assets match this filter."
              : "No assets yet. Track appliances, electronics, and valuables."}
          </p>
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="mr-1 size-4" />
            Add first asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
