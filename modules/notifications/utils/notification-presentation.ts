import {
  BanIcon,
  BellIcon,
  CalendarOffIcon,
  CircleCheckIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  MegaphoneIcon,
  OctagonXIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  RotateCwIcon,
  SendIcon,
  ShieldCheckIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import {
  isNotificationType,
  type NotificationType,
} from "@/modules/notifications/constants/notification-types";

export type NotificationTone = "default" | "success" | "destructive";

type Presentation = {
  icon: LucideIcon;
  tone: NotificationTone;
};

const PRESENTATION: Record<NotificationType, Presentation> = {
  account_approved: { icon: UserRoundCheckIcon, tone: "success" },
  account_rejected: { icon: UserRoundXIcon, tone: "destructive" },
  account_submitted: { icon: ClipboardCheckIcon, tone: "default" },
  account_resubmitted: { icon: SendIcon, tone: "default" },
  admin_registered: { icon: ShieldCheckIcon, tone: "default" },
  flight_request_submitted: { icon: ClipboardCheckIcon, tone: "default" },
  flight_request_approved: { icon: CircleCheckIcon, tone: "success" },
  flight_request_rejected: { icon: OctagonXIcon, tone: "destructive" },
  flight_request_withdrawn: { icon: RotateCwIcon, tone: "default" },
  flight_commenced: { icon: PlaneTakeoffIcon, tone: "default" },
  flight_arrived: { icon: PlaneLandingIcon, tone: "success" },
  flight_cancelled: { icon: BanIcon, tone: "destructive" },
  flight_no_show: { icon: Clock3Icon, tone: "destructive" },
  notam_posted: { icon: MegaphoneIcon, tone: "default" },
  aircraft_status_changed: { icon: WrenchIcon, tone: "default" },
  instructor_unavailable: { icon: CalendarOffIcon, tone: "default" },
};

const FALLBACK: Presentation = { icon: BellIcon, tone: "default" };

// A type added by a migration ahead of the deployed client still renders,
// falling back to the neutral bell rather than throwing.
export function getNotificationPresentation(type: string): Presentation {
  return isNotificationType(type) ? PRESENTATION[type] : FALLBACK;
}
