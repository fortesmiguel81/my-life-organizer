function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** "today" / "tomorrow" / "2d overdue" / "in 5d" / "Sep 6" for dates farther out. */
export function relativeDayLabel(date: Date | string, now: Date = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffDays = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / 86_400_000
  );

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "1d overdue";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 6) return `in ${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
