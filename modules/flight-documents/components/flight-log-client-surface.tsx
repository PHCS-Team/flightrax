"use client";

import {
  ChevronDownIcon,
  FileTextIcon,
  NotebookTextIcon,
  ScaleIcon,
  TowerControlIcon,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightJourneyReviewCard } from "@/modules/flight-documents/components/flight-journey-review-card";
import { FlightPlanReviewCard } from "@/modules/flight-documents/components/flight-plan-review-card";
import { WeightBalanceReviewCard } from "@/modules/flight-documents/components/weight-balance-review-card";
import { useFlightJourney } from "@/modules/flight-documents/hooks/use-flight-journey.query";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type LogSectionId = "plan" | "weight-balance" | "journey";

function LogAccordionSection({
  children,
  icon: Icon,
  onToggle,
  open,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  onToggle: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <div className="overflow-hidden border-t border-primary-foreground/15 sm:rounded-2xl sm:border sm:border-primary-foreground/20">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground transition hover:bg-primary/85 sm:px-5"
        onClick={onToggle}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/15 bg-primary-foreground/10">
            <Icon className="size-4 text-primary-foreground/70" />
          </span>
          <span className="truncate text-base font-semibold tracking-tight">
            {title}
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-primary-foreground/60 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="*:data-[slot=glass-surface]:rounded-none *:data-[slot=glass-surface]:border-0 *:data-[slot=glass-surface]:sm:rounded-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightLogClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<LogSectionId | null>("plan");
  const flightPlanQuery = useOwnFlightPlanForEdit(flightPlanId);
  const weightBalanceQuery = useWeightBalanceContext(flightPlanId);
  const journeyQuery = useFlightJourney(flightPlanId);

  if (
    flightPlanQuery.isPending ||
    weightBalanceQuery.isPending ||
    journeyQuery.isPending
  ) {
    return <LoadingScreen />;
  }

  const error =
    flightPlanQuery.error ?? weightBalanceQuery.error ?? journeyQuery.error;

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<NotebookTextIcon className="size-7" />}
        title="Flight log could not be loaded"
      />
    );
  }

  const flightPlan = flightPlanQuery.flightPlan;

  if (!flightPlan) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/account")} type="button">
            Back to account
          </Button>
        }
        description="This flight log does not exist or you do not have permission to view it."
        icon={<NotebookTextIcon className="size-7" />}
        title="Flight Log Not Found"
      />
    );
  }

  function toggleSection(section: LogSectionId) {
    setOpenSection((current) => (current === section ? null : section));
  }

  return (
    <div className="grid sm:gap-4">
      <AircraftHeaderCard aircraft={flightPlan.aircraft} />

      <LogAccordionSection
        icon={FileTextIcon}
        onToggle={() => toggleSection("plan")}
        open={openSection === "plan"}
        title="Flight Plan"
      >
        <FlightPlanReviewCard
          aircraft={flightPlan.aircraft}
          filedByName={flightPlan.filedByName}
          instructorName={flightPlan.instructorName}
          showHeading={false}
          values={flightPlan.values}
        />
      </LogAccordionSection>

      <LogAccordionSection
        icon={ScaleIcon}
        onToggle={() => toggleSection("weight-balance")}
        open={openSection === "weight-balance"}
        title="Weight & Balance"
      >
        <WeightBalanceReviewCard
          context={weightBalanceQuery.context}
          showHeading={false}
        />
      </LogAccordionSection>

      <LogAccordionSection
        icon={TowerControlIcon}
        onToggle={() => toggleSection("journey")}
        open={openSection === "journey"}
        title="Flight Journey"
      >
        <FlightJourneyReviewCard journey={journeyQuery.journey} />
      </LogAccordionSection>
    </div>
  );
}
