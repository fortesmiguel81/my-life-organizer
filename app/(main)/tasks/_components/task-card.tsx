"use client";

import { Draggable } from "@hello-pangea/dnd";
import { format, isPast, isToday } from "date-fns";
import { CalendarDays, ChevronRight, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOpenTask } from "@/features/tasks/hooks/use-open-task";

const PRIORITY_BORDER: Record<string, string> = {
  low: "border-l-slate-400",
  medium: "border-l-blue-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done";
  dueDate: string | Date | null;
  subtaskCount: number;
};

export default function TaskCard({ task, index }: { task: Task; index: number }) {
  const { onOpen } = useOpenTask();
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && task.status !== "done";
  const isDueToday = dueDateObj && isToday(dueDateObj);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task.id)}
          className={cn(
            "group cursor-pointer rounded-md border-l-4 bg-background p-3 shadow-sm transition-shadow hover:shadow-md",
            PRIORITY_BORDER[task.priority],
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/30"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm font-medium leading-snug", task.status === "done" && "line-through text-muted-foreground")}>
              {task.title}
            </p>
            <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={cn("text-[10px] font-medium", PRIORITY_BADGE[task.priority])}>
              {task.priority}
            </Badge>

            {dueDateObj && (
              <span className={cn(
                "flex items-center gap-0.5 text-[10px]",
                isOverdue ? "font-semibold text-red-500" : isDueToday ? "font-medium text-orange-500" : "text-muted-foreground"
              )}>
                <CalendarDays className="size-3" />
                {isOverdue ? "Overdue · " : isDueToday ? "Today · " : ""}
                {format(dueDateObj, "MMM d")}
              </span>
            )}

            {task.subtaskCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Layers className="size-3" />
                {task.subtaskCount}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
