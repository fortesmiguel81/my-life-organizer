"use client";

import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { cn } from "@/lib/utils";
import { useNewTask } from "@/features/tasks/hooks/use-new-task";

import TaskCard from "./task-card";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
] as const;

type Status = "todo" | "in_progress" | "done";

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: Status;
  dueDate: string | null;
  subtaskCount: number;
  assignedTo: string | null;
};

type Props = { tasks: Task[]; activeListId?: string };

export default function KanbanBoard({ tasks, activeListId }: Props) {
  const queryClient = useQueryClient();
  const { onOpen } = useNewTask();

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const res = await client.api.tasks[":id"].$patch({
        param: { id },
        json: { status },
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as Status;
    const task = tasks.find((t) => t.id === result.draggableId);
    if (!task || task.status === newStatus) return;
    statusMutation.mutate({ id: task.id, status: newStatus });
  };

  const byStatus = (s: Status) => tasks.filter((t) => t.status === s);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = byStatus(col.id);
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
                  className="rounded p-1 text-lg leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Add task to ${col.label}`}
                >
                  +
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
