"use client";

import { useEffect, useState } from "react";

import {
  DragDropContext,
  Draggable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";

import { Skeleton } from "@/components/ui/skeleton";
import { useEditProfile } from "@/features/profiles/api/use-edit-profile";
import { useGetCurrentProfile } from "@/features/profiles/api/use-get-current-profile";
import { cn } from "@/lib/utils";

import { useGetDashboard } from "../api/use-get-dashboard";
import {
  DEFAULT_LAYOUT,
  SECTION_LABELS,
  type SectionId,
  type WidgetId,
  mergeLayout,
} from "../constants";
import AssetsWidget from "./widgets/assets-widget";
import CalendarWidget from "./widgets/calendar-widget";
import DocumentsWidget from "./widgets/documents-widget";
import FinanceWidget from "./widgets/finance-widget";
import HabitsWidget from "./widgets/habits-widget";
import MaintenanceWidget from "./widgets/maintenance-widget";
import ShoppingWidget from "./widgets/shopping-widget";
import TasksWidget from "./widgets/tasks-widget";
import UtilitiesWidget from "./widgets/utilities-widget";
import VendorsWidget from "./widgets/vendors-widget";

type DashboardData = ReturnType<typeof useGetDashboard>["data"];

function renderWidget(
  id: WidgetId,
  data: NonNullable<DashboardData>,
  dragHandleProps: DraggableProvidedDragHandleProps | null
) {
  switch (id) {
    case "habits":
      return (
        <HabitsWidget {...data.habits} dragHandleProps={dragHandleProps} />
      );
    case "tasks":
      return <TasksWidget {...data.tasks} dragHandleProps={dragHandleProps} />;
    case "calendar":
      return (
        <CalendarWidget {...data.calendar} dragHandleProps={dragHandleProps} />
      );
    case "finance":
      return (
        <FinanceWidget {...data.finance} dragHandleProps={dragHandleProps} />
      );
    case "maintenance":
      return (
        <MaintenanceWidget
          {...data.maintenance}
          dragHandleProps={dragHandleProps}
        />
      );
    case "assets":
      return (
        <AssetsWidget {...data.assets} dragHandleProps={dragHandleProps} />
      );
    case "utilities":
      return (
        <UtilitiesWidget
          {...data.utilities}
          dragHandleProps={dragHandleProps}
        />
      );
    case "vendors":
      return (
        <VendorsWidget {...data.vendors} dragHandleProps={dragHandleProps} />
      );
    case "shopping":
      return (
        <ShoppingWidget {...data.shopping} dragHandleProps={dragHandleProps} />
      );
    case "documents":
      return (
        <DocumentsWidget
          {...data.documents}
          dragHandleProps={dragHandleProps}
        />
      );
  }
}

function SectionSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  );
}

export default function DashboardView() {
  const dashboardQuery = useGetDashboard();
  const profileQuery = useGetCurrentProfile();
  const editProfile = useEditProfile();

  const [layout, setLayout] =
    useState<Record<SectionId, WidgetId[]>>(DEFAULT_LAYOUT);

  useEffect(() => {
    if (profileQuery.data) {
      setLayout(mergeLayout(profileQuery.data.dashboardLayout));
    }
  }, [profileQuery.data]);

  const isLoading = dashboardQuery.isLoading || profileQuery.isLoading;

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;

    const section = source.droppableId as SectionId;
    const next = { ...layout };
    const ids = [...next[section]];
    const [moved] = ids.splice(source.index, 1);
    ids.splice(destination.index, 0, moved);
    next[section] = ids;

    setLayout(next);

    if (!profileQuery.data) return;
    editProfile.mutate({
      id: profileQuery.data.id,
      values: { dashboardLayout: next },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <DragDropContext onDragEnd={onDragEnd}>
        {(Object.keys(SECTION_LABELS) as SectionId[]).map((section) => (
          <div key={section}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {SECTION_LABELS[section]}
            </p>

            {isLoading || !dashboardQuery.data ? (
              <SectionSkeleton count={layout[section].length} />
            ) : (
              <Droppable droppableId={section} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  >
                    {layout[section].map((widgetId, index) => (
                      <Draggable
                        key={widgetId}
                        draggableId={widgetId}
                        index={index}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={cn(
                              "group",
                              widgetId === "finance" && "sm:col-span-2",
                              snapshot.isDragging && "z-10"
                            )}
                          >
                            {renderWidget(
                              widgetId,
                              dashboardQuery.data,
                              dragProvided.dragHandleProps
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
