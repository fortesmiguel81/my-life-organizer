export type WidgetId =
  | "habits"
  | "tasks"
  | "calendar"
  | "finance"
  | "maintenance"
  | "assets"
  | "utilities"
  | "vendors"
  | "shopping"
  | "documents";

export type SectionId = "today" | "money" | "home" | "household";

export const SECTION_LABELS: Record<SectionId, string> = {
  today: "Today",
  money: "Money",
  home: "Home",
  household: "Household",
};

export const DEFAULT_LAYOUT: Record<SectionId, WidgetId[]> = {
  today: ["habits", "tasks", "calendar"],
  money: ["finance"],
  home: ["maintenance", "assets", "utilities", "vendors"],
  household: ["shopping", "documents"],
};

/**
 * Merges a profile's saved widget order with the default layout: drops ids
 * that no longer exist (a widget was removed from the app) and appends any
 * default ids missing from the saved order (a widget was added since the
 * profile last saved), so every known widget always renders exactly once.
 */
export function mergeLayout(
  saved: Record<string, string[]> | null | undefined
): Record<SectionId, WidgetId[]> {
  const result = {} as Record<SectionId, WidgetId[]>;

  for (const section of Object.keys(DEFAULT_LAYOUT) as SectionId[]) {
    const defaults = DEFAULT_LAYOUT[section];
    const savedOrder = saved?.[section];

    if (!savedOrder) {
      result[section] = defaults;
      continue;
    }

    const validSaved = savedOrder.filter((id): id is WidgetId =>
      (defaults as string[]).includes(id)
    );
    const missing = defaults.filter((id) => !validSaved.includes(id));
    result[section] = [...validSaved, ...missing];
  }

  return result;
}
