"use client";

import { useState } from "react";

import { Kanban, List, Pencil, Plus } from "lucide-react";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetTaskLists } from "@/features/tasks/api/use-get-task-lists";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import EditTaskListSheet from "@/features/tasks/components/edit-task-list-sheet";
import { useNewTask } from "@/features/tasks/hooks/use-new-task";
import { useNewTaskList } from "@/features/tasks/hooks/use-new-task-list";

import KanbanBoard from "./kanban-board";
import TaskListView from "./task-list-view";

type View = "kanban" | "list";

export default function TasksView() {
  const [activeListId, setActiveListId] = useState<string | undefined>();
  const [view, setView] = useState<View>("kanban");
  const [editingList, setEditingList] = useState<{ id: string; name: string; icon: string | null; color: string | null } | null>(null);

  const { onOpen: openNewList } = useNewTaskList();
  const { onOpen: openNewTask } = useNewTask();

  const listsQuery = useGetTaskLists();
  const tasksQuery = useGetTasks({ listId: activeListId });

  const lists = listsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const activeList = lists.find((l) => l.id === activeListId);

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      {/* Sidebar */}
      <aside className="flex w-52 shrink-0 flex-col gap-1">
        <button
          onClick={() => setActiveListId(undefined)}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
            !activeListId && "bg-muted font-semibold"
          )}
        >
          All tasks
          <span className="ml-auto text-xs text-muted-foreground">
            {lists.reduce((s, l) => s + (l.taskCount ?? 0), 0)}
          </span>
        </button>

        {listsQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="group flex items-center gap-1">
              <button
                onClick={() => setActiveListId(list.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  activeListId === list.id && "bg-muted font-semibold"
                )}
              >
                {list.icon && <span>{list.icon}</span>}
                <span
                  className="mr-1 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: list.color ?? "#6b7280" }}
                />
                <span className="truncate">{list.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {list.taskCount ?? 0}
                </span>
              </button>
              <button
                onClick={() => setEditingList(list)}
                className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              >
                <Pencil className="size-3 text-muted-foreground" />
              </button>
            </div>
          ))
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-1 justify-start gap-2 text-muted-foreground"
          onClick={openNewList}
        >
          <Plus className="size-4" />
          New list
        </Button>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {activeList ? `${activeList.icon ?? ""} ${activeList.name}` : "All tasks"}
          </h2>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md border">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "rounded-l-md p-1.5 transition-colors hover:bg-muted",
                  view === "kanban" && "bg-muted"
                )}
                aria-label="Kanban view"
              >
                <Kanban className="size-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "rounded-r-md p-1.5 transition-colors hover:bg-muted",
                  view === "list" && "bg-muted"
                )}
                aria-label="List view"
              >
                <List className="size-4" />
              </button>
            </div>

            <Button size="sm" onClick={() => openNewTask(activeListId)}>
              <Plus className="mr-1 size-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Content */}
        {tasksQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="icon" />
          </div>
        ) : view === "kanban" ? (
          <KanbanBoard tasks={tasks} activeListId={activeListId} />
        ) : (
          <TaskListView tasks={tasks} />
        )}
      </div>

      {/* Edit list sheet (inline, not in provider) */}
      {editingList && (
        <EditTaskListSheet
          {...editingList}
          isOpen={!!editingList}
          onClose={() => setEditingList(null)}
        />
      )}
    </div>
  );
}
