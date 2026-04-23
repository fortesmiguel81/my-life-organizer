"use client";

import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

import { useNewTask } from "@/features/tasks/hooks/use-new-task";
import { cn } from "@/lib/utils";

import TaskCard from "./task-card";

const COLUMNS = [
  { id: "todo" as const, label: "To Do" },
  { id: "in_progress" as const, label: "In Progress" },
  { id: "done" as const, label: "Done" },
];

type Status = "todo" | "in_progress" | "done";

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: Status;
  order: number;
  dueDate: string | Date | null;
  subtaskCount: number;
  listId: string;
};

type Props = { tasks: Task[]; activeListId?: string };

export default function KanbanBoard({ tasks, activeListId }: Props) {
  const { onOpen } = useNewTask();
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const newStatus = destination.droppableId as Status;
    const task = localTasks.find((t) => t.id === draggableId);
    if (!task) return;

    const sameColumn = task.status === newStatus;
    if (sameColumn && source.index === destination.index) return;

    // Compute new order using fractional indexing against destination column neighbours
    const destColTasks = localTasks
      .filter((t) => t.status === newStatus && t.id !== task.id)
      .sort((a, b) => a.order - b.order);

    const before = destColTasks[destination.index - 1];
    const after = destColTasks[destination.index];
    const newOrder =
      before && after ? (before.order + after.order) / 2
      : before ? before.order + 1
      : after ? after.order - 1
      : 0;

    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, order: newOrder }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        // Don't invalidate immediately — optimistic state is already correct
        // and invalidating mid-animation causes a flicker
      })
      .catch(() => {
        setLocalTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: task.status, order: task.order } : t
          )
        );
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = localTasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.order - b.order);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onOpen(activeListId, col.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={`Add to ${col.label}`}
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-2 transition-colors",
                      snapshot.isDraggingOver ? "bg-muted/60" : "bg-muted/20"
                    )}
                  >
                    {colTasks.map((task, i) => (
                      <TaskCard key={task.id} task={task} index={i} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
