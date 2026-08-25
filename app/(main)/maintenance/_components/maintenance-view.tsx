"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, MapPin, Plus, Wrench } from "lucide-react";

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
import { useGetMaintenanceTasks } from "@/features/maintenance/api/use-get-maintenance-tasks";
import {
  CATEGORY_OPTIONS,
  FREQUENCY_OPTIONS,
} from "@/features/maintenance/components/maintenance-task-form";
import { useNewMaintenanceTask } from "@/features/maintenance/hooks/use-new-maintenance-task";
import { useOpenMaintenanceTask } from "@/features/maintenance/hooks/use-open-maintenance-task";

type Task = {
  id: string;
  title: string;
  category: string;
  assetName: string | null;
  vendorName: string | null;
  frequency: string;
  dueDate: string | Date | null;
};

function isOverdue(date: string | Date | null) {
  if (!date) return false;
  return new Date(date) < new Date();
}

function isDueSoon(date: string | Date | null) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return d >= now && d <= in14Days;
}

function TaskCard({ task }: { task: Task }) {
  const { onOpen } = useOpenMaintenanceTask();
  const categoryLabel = CATEGORY_OPTIONS.find(
    (c) => c.value === task.category
  )?.label;
  const frequencyLabel = FREQUENCY_OPTIONS.find(
    (f) => f.value === task.frequency
  )?.label;
  const overdue = isOverdue(task.dueDate);
  const dueSoon = isDueSoon(task.dueDate);

  return (
    <button
      onClick={() => onOpen(task.id)}
      className="flex flex-col items-start gap-2 rounded-xl border bg-background p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="truncate font-semibold">{task.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-[10px]">
          {categoryLabel}
        </Badge>
        {task.frequency !== "none" && (
          <Badge variant="outline" className="text-[10px]">
            {frequencyLabel}
          </Badge>
        )}
        {overdue && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="size-3" />
            Overdue
          </Badge>
        )}
        {!overdue && dueSoon && (
          <Badge className="gap-1 bg-amber-500 text-[10px] hover:bg-amber-500">
            <AlertTriangle className="size-3" />
            Due soon
          </Badge>
        )}
      </div>
      {task.dueDate && (
        <p className="text-xs text-muted-foreground">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      {task.assetName && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {task.assetName}
        </p>
      )}
      {task.vendorName && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wrench className="size-3" />
          {task.vendorName}
        </p>
      )}
    </button>
  );
}

export default function MaintenanceView() {
  const { onOpen: openNew } = useNewMaintenanceTask();
  const { data: tasks, isLoading } = useGetMaintenanceTasks();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!tasks) return [];
    if (categoryFilter === "all") return tasks;
    return tasks.filter((t) => t.category === categoryFilter);
  }, [tasks, categoryFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-56">
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
          New task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <span className="text-5xl">🔧</span>
          <p className="text-sm">
            {tasks?.length
              ? "No tasks match this filter."
              : "No maintenance tasks yet. Track HVAC filters, gutters, smoke detectors, and more."}
          </p>
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="mr-1 size-4" />
            Add first task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
