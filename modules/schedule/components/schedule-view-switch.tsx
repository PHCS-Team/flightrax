"use client";

import { CalendarDaysIcon, FileSpreadsheetIcon } from "lucide-react";

import { ScheduleClientSurface } from "@/modules/schedule/components/schedule-client-surface";
import { ScheduleUploadsClientSurface } from "@/modules/schedule/components/schedule-uploads-client-surface";
import type { ScheduleView } from "@/modules/schedule/constants/schedule-views";
import { useScheduleView } from "@/modules/schedule/hooks/use-schedule-view";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function ScheduleViewSwitch({ canManage }: { canManage: boolean }) {
  const [view, setView] = useScheduleView();

  return (
    <div className="sm:space-y-4">
      <Tabs
        onValueChange={(value) => setView(value as ScheduleView)}
        value={view}
      >
        <TabsList className="w-full justify-start border-x-0 border-y border-primary-foreground/15 p-1.5 md:w-fit md:border-x">
          <TabsTrigger value="board">
            <CalendarDaysIcon />
            Board
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileSpreadsheetIcon />
            Files
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "files" ? (
        <ScheduleUploadsClientSurface canManage={canManage} />
      ) : (
        <ScheduleClientSurface canManage={canManage} />
      )}
    </div>
  );
}
