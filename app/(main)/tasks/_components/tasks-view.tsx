"use client";

import { useState } from "react";

import { Kanban, LayoutList, Pencil, Plus } from "lucide-react";

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
import { useGetTaskLists } from "@/features/tasks/api/use-get-task-lists";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useNewTask } from "@/features/tasks/hooks/use-new-task";
import { useNewTaskList } from "@/features/tasks/hooks/use-new-task-list";
import { useOpenTask } from "@/features/tasks/hooks/use-open-task";
import { useOpenTaskList } from "@/features/tasks/hooks/use-open-task-list";
import { cn } from "@/lib/utils";

import KanbanBoard from "./kanban-board";

type View = "kanban" | "list";
type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "done";

const PRIORITY_BADGE: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const STATUS_LABEL: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TasksView() {
  const [view, setView] = useState<View>("kanban");
  const [activeListId, setActiveListId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  const { onOpen: openNewList } = useNewTaskList();
  const { onOpen: openNewTask } = useNewTask();
  const { onOpen: openTask } = useOpenTask();
  const { onOpen: openEditList } = useOpenTaskList();

  const listsQuery = useGetTaskLists();
  const tasksQuery = useGetTasks({
    listId: activeListId,
    status: filterStatus !== "all" ? filterStatus : undefined,
    priority: filterPriority !== "all" ? filterPriority : undefined,
  });

  const lists = listsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const activeList = lists.find((l) => l.id === activeListId);

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
          All tasks
          <Badge variant="secondary" className="ml-auto text-xs">
            {lists.reduce((sum, l) => sum + (l.taskCount ?? 0), 0)}
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
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: list.color ?? "#6b7280" }}
                />
                <span className="truncate">
                  {list.icon} {list.name}
                </span>
              </button>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {list.taskCount}
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
          <h2 className="text-base font-semibold">
            {activeList
              ? `${activeList.icon ?? ""} ${activeList.name}`
              : "All tasks"}
          </h2>

          <div className="ml-auto flex items-center gap-2 p-1">
            {/* Filters */}
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as Status | "all")}
            >
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterPriority}
              onValueChange={(v) => setFilterPriority(v as Priority | "all")}
            >
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex h-9 rounded-md border">
              <Button
                size="sm"
                variant={view === "kanban" ? "secondary" : "ghost"}
                className="h-9 rounded-r-none px-2"
                onClick={() => setView("kanban")}
              >
                <Kanban className="size-4" />
              </Button>
              <Button
                size="sm"
                variant={view === "list" ? "secondary" : "ghost"}
                className="h-9 rounded-l-none px-2"
                onClick={() => setView("list")}
              >
                <LayoutList className="size-4" />
              </Button>
            </div>

            <Button size="sm" onClick={() => openNewTask(activeListId, "todo")}>
              <Plus className="mr-1 size-4" />
              New task
            </Button>
          </div>
        </div>

        {/* Content */}
        {tasksQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="icon" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-sm">No tasks yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openNewTask(activeListId)}
            >
              <Plus className="mr-1 size-4" />
              Add first task
            </Button>
          </div>
        ) : view === "kanban" ? (
          <div className="flex-1 overflow-y-auto pb-4">
            <KanbanBoard tasks={tasks} activeListId={activeListId} />
          </div>
        ) : (
          <div className="flex-1 space-y-1 overflow-y-auto pb-4">
            {tasks.map((task) => {
              const p = task.priority as Priority;
              const s = task.status as Status;
              return (
                <div
                  key={task.id}
                  onClick={() => openTask(task.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        s === "done"
                          ? "#22c55e"
                          : s === "in_progress"
                            ? "#3b82f6"
                            : "#6b7280",
                    }}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      s === "done" && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px]", PRIORITY_BADGE[p])}
                  >
                    {p}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABEL[s]}
                  </span>
                  <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
