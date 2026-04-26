"use client";

import { useState } from "react";

import { Check, Pencil, Plus, Flame } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetHabits } from "@/features/habits/api/use-get-habits";
import { useGetHabitLogs } from "@/features/habits/api/use-get-habit-logs";
import { useGetHabitStats } from "@/features/habits/api/use-get-habit-stats";
import { useLogHabit } from "@/features/habits/api/use-log-habit";
import { useNewHabit } from "@/features/habits/hooks/use-new-habit";
import { useOpenHabit } from "@/features/habits/hooks/use-open-habit";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function heatmapDates(weeks = 12) {
  const today = new Date();
  const total = weeks * 7;
  const start = new Date(today);
  start.setDate(start.getDate() - total + 1);

  const allDates: string[] = [];
  const cur = new Date(start);
  while (cur <= today) {
    allDates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return allDates;
}

// ── sub-components ────────────────────────────────────────────────────────────

type Habit = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: "daily" | "weekly";
  targetDays: number | null;
  reminderTime: string | null;
  todayCompleted: boolean;
  todayLogId: string | null;
  currentStreak: number;
  dueToday: boolean;
};

function HabitCard({ habit }: { habit: Habit }) {
  const logMutation = useLogHabit();
  const { onOpen } = useOpenHabit();
  const today = todayStr();

  const toggle = () => {
    logMutation.mutate({
      id: habit.id,
      json: { date: today, completed: !habit.todayCompleted },
    });
  };

  return (
    <div
      className="flex items-center gap-4 rounded-xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftColor: habit.color ?? "#6366f1", borderLeftWidth: 3 }}
    >
      {/* Check button */}
      <button
        onClick={toggle}
        disabled={logMutation.isPending}
        style={habit.todayCompleted ? { backgroundColor: habit.color ?? "#6366f1" } : undefined}
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          habit.todayCompleted
            ? "border-transparent text-white scale-95"
            : "border-border hover:scale-105"
        )}
      >
        {habit.todayCompleted ? (
          <Check className="size-6" />
        ) : (
          <span className="text-2xl">{habit.icon ?? "✅"}</span>
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate font-semibold", habit.todayCompleted && "line-through text-muted-foreground")}>
            {habit.title}
          </p>
          {!habit.dueToday && (
            <Badge variant="secondary" className="text-[10px]">rest day</Badge>
          )}
        </div>
        {habit.description && (
          <p className="truncate text-xs text-muted-foreground">{habit.description}</p>
        )}
      </div>

      {/* Streak */}
      {habit.currentStreak > 0 && (
        <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-500">
          <Flame className="size-4" />
          {habit.currentStreak}
        </div>
      )}

      {/* Edit */}
      <button
        onClick={() => onOpen(habit.id)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}

function HabitHeatmap({ habitId, color }: { habitId: string; color: string }) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 83);

  const { data: logs } = useGetHabitLogs(
    habitId,
    from.toISOString().split("T")[0],
    today.toISOString().split("T")[0]
  );

  const completedSet = new Set(
    (logs ?? []).filter((l) => l.completed).map((l) => l.date)
  );

  const dates = heatmapDates(12);
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((date) => (
            <div
              key={date}
              title={date}
              style={completedSet.has(date) ? { backgroundColor: color } : undefined}
              className={cn(
                "size-3 rounded-sm",
                completedSet.has(date) ? "opacity-90" : "bg-muted"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HabitOverviewCard({ habit }: { habit: Habit }) {
  const { data: stats } = useGetHabitStats(habit.id);
  const { onOpen } = useOpenHabit();

  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.icon}</span>
          <span className="font-semibold">{habit.title}</span>
        </div>
        <button
          onClick={() => onOpen(habit.id)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      <HabitHeatmap habitId={habit.id} color={habit.color ?? "#6366f1"} />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold" style={{ color: habit.color ?? "#6366f1" }}>
            {stats?.currentStreak ?? 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Current streak</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold">{stats?.longestStreak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Best streak</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold">{stats?.completionRate30d ?? 0}%</p>
          <p className="text-[10px] text-muted-foreground">30-day rate</p>
        </div>
      </div>
    </div>
  );
}

// ── main view ─────────────────────────────────────────────────────────────────

export default function HabitsView() {
  const [tab, setTab] = useState<"today" | "overview">("today");
  const { onOpen: openNew } = useNewHabit();
  const { data: habits, isLoading } = useGetHabits();

  const today = todayStr();
  const dueToday = (habits ?? []).filter((h) => h.dueToday);
  const completedToday = dueToday.filter((h) => h.todayCompleted).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs + New habit */}
      <div className="flex items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "today" | "overview")} className="flex-1">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={openNew} className="shrink-0">
          <Plus className="mr-1 size-4" />
          New habit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : !habits?.length ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <span className="text-5xl">🌱</span>
          <p className="text-sm">No habits yet. Start building a routine!</p>
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="mr-1 size-4" />
            Create first habit
          </Button>
        </div>
      ) : tab === "today" ? (
        <>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedToday} of {dueToday.length} completed
              </span>
              <span className="font-medium">
                {dueToday.length > 0
                  ? Math.round((completedToday / dueToday.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${dueToday.length > 0 ? (completedToday / dueToday.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Due today */}
          {dueToday.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dueToday.map((h) => (
                <HabitCard key={h.id} habit={h} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No habits scheduled for today. Enjoy your rest day! 🎉
            </p>
          )}

          {/* Rest-day habits (collapsed) */}
          {habits.filter((h) => !h.dueToday).length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground">
                <span className="underline underline-offset-2">
                  {habits.filter((h) => !h.dueToday).length} habit
                  {habits.filter((h) => !h.dueToday).length !== 1 ? "s" : ""} not scheduled today
                </span>
              </summary>
              <div className="mt-2 flex flex-col gap-2 opacity-60">
                {habits.filter((h) => !h.dueToday).map((h) => (
                  <HabitCard key={h.id} habit={h} />
                ))}
              </div>
            </details>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {habits.map((h) => (
            <HabitOverviewCard key={h.id} habit={h} />
          ))}
        </div>
      )}
    </div>
  );
}
