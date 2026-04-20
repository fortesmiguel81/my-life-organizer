import TasksView from "./_components/tasks-view";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Manage your to-dos and shared household tasks
        </p>
      </div>
      <TasksView />
    </div>
  );
}
