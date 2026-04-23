"use client";

import { format, isPast, isToday } from "date-fns";
import { CalendarDays, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useEditTask } from "@/features/tasks/api/use-edit-task";
import { useOpenTask } from "@/features/tasks/hooks/use-open-task";

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done";
  dueDate: string | null;
  subtaskCount: number;
  assignedTo: string | null;
};

export default function TaskListView({ tasks }: { tasks: Task[] }) {
  const { onOpen } = useOpenTask();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <p className="text-sm">No tasks yet.</p>
        <p className="text-xs">Click + New Task to add one.</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-background">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onOpen={onOpen} />
      ))}
    </div>
  );
}

function TaskRow({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const editMutation = useEditTask(task.id);
  const isDone = task.status === "done";

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !isDone;
  const isDueToday = dueDateObj && isToday(dueDateObj);

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    editMutation.mutate({ status: isDone ? "todo" : "done" });
  };

  return (
    <div
      onClick={() => onOpen(task.id)}
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <div onClick={toggleDone}>
        <Checkbox checked={isDone} className="mt-0.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", isDone && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-[10px]", PRIORITY_BADGE[task.priority])}>
            {task.priority}
          </Badge>
          {dueDateObj && (
            <span className={cn("flex items-center gap-0.5 text-[10px]", isOverdue ? "text-red-500 font-semibold" : isDueToday ? "text-orange-500" : "text-muted-foreground")}>
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
    </div>
  );
}
