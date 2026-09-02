"use client";

import {
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  RadarIcon,
  WrenchIcon,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { OrganizedFlightStatusBoard } from "@/modules/dashboard/components/organized-flight-status-board";
import { LiveClock } from "@/modules/dashboard/components/live-clock";
import { useDashboardFlightStatus } from "@/modules/dashboard/hooks/use-flight-status.query";
import { useFlightStatusRealtime } from "@/modules/dashboard/hooks/use-flight-status-realtime";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { PageHeader } from "@/shared/components/layout/page-header";

const PAGE_SIZE = 10;

export function OrganizedFlightStatusClientSurface() {
  const [departedPage, setDepartedPage] = useQueryState(
    "departedPage",
    parseAsInteger.withDefault(1),
  );
  const [arrivedPage, setArrivedPage] = useQueryState(
    "arrivedPage",
    parseAsInteger.withDefault(1),
  );
  const [groundPage, setGroundPage] = useQueryState(
    "groundPage",
    parseAsInteger.withDefault(1),
  );

  const departed = useDashboardFlightStatus(departedPage, PAGE_SIZE, "active");
  const arrived = useDashboardFlightStatus(arrivedPage, PAGE_SIZE, "arrived");
  const onGround = useDashboardFlightStatus(groundPage, PAGE_SIZE, "on_ground");

  useFlightStatusRealtime();

  const isPending =
    departed.isPending || arrived.isPending || onGround.isPending;
  const error = departed.error ?? arrived.error ?? onGround.error;

  return (
    <section>
      <PageHeader
        action={<LiveClock />}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }]}
        title="Home"
      />

      {isPending ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState
          description={error.message}
          icon={<RadarIcon className="size-7" />}
          title="Flight status could not be loaded"
        />
      ) : (
        <OrganizedFlightStatusBoard
          groups={[
            {
              id: "departed",
              title: "Departed",
              icon: PlaneTakeoffIcon,
              emptyMessage: "No departed flights right now.",
              rows: departed.rows,
              page: departedPage,
              totalPages: departed.totalPages,
              onPageChange: setDepartedPage,
            },
            {
              id: "arrived",
              title: "Arrived",
              icon: PlaneLandingIcon,
              emptyMessage: "No arrived flights today.",
              rows: arrived.rows,
              page: arrivedPage,
              totalPages: arrived.totalPages,
              onPageChange: setArrivedPage,
            },
            {
              id: "on-ground",
              title: "On Ground",
              icon: WrenchIcon,
              emptyMessage: "No aircraft on ground.",
              rows: onGround.rows,
              page: groundPage,
              totalPages: onGround.totalPages,
              onPageChange: setGroundPage,
            },
          ]}
        />
      )}
    </section>
  );
}
