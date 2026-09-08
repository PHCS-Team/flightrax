import type { MonitorBoard, MonitorFlightRow } from "@/modules/monitor/types/monitor";

const MINUTE_MS = 60 * 1000;

function at(nowMs: number, offsetMinutes: number): string {
  return new Date(nowMs + offsetMinutes * MINUTE_MS).toISOString();
}

type PreviewFlight = {
  registrationMark: string;
  destination: string;
  totalEet: string;
  traineeName: string;
  instructorName: string;
};

const ON_GROUND: Array<PreviewFlight & { departsInMinutes: number }> = [
  { registrationMark: "RP-C2389", destination: "Binalonan", totalEet: "01:00", traineeName: "REYES, JUAN M.", instructorName: "SANTOS, JAYPEE R.", departsInMinutes: -25 },
  { registrationMark: "RP-C4605", destination: "Binalonan", totalEet: "01:00", traineeName: "TAN, CARLO D.", instructorName: "VILLANUEVA, LAEL B.", departsInMinutes: 15 },
  { registrationMark: "RP-C1029", destination: "Laoag International Airport", totalEet: "01:40", traineeName: "RIZAL, JOSE P.", instructorName: "CRUZ, KEVIN A.", departsInMinutes: 40 },
  { registrationMark: "RP-C1993", destination: "Vigan", totalEet: "01:20", traineeName: "BAWAS, JEROME L.", instructorName: "DELA CRUZ, FRENN O.", departsInMinutes: 55 },
  { registrationMark: "RP-C1975", destination: "Lingayen", totalEet: "00:50", traineeName: "RUIZ, JASMINE T.", instructorName: "GARCIA, RIC S.", departsInMinutes: 70 },
  { registrationMark: "RP-C2381", destination: "Binalonan", totalEet: "01:00", traineeName: "MANZANO, KYLE E.", instructorName: "LAU, MARVIN C.", departsInMinutes: 90 },
  { registrationMark: "RP-C1984", destination: "Baguio", totalEet: "01:10", traineeName: "ABDON, DANIEL V.", instructorName: "CRUZ, KEVIN A.", departsInMinutes: 110 },
  { registrationMark: "RP-C1971", destination: "Binalonan", totalEet: "01:00", traineeName: "ROSARIO, GABRIEL N.", instructorName: "JASCHA, PAOLO M.", departsInMinutes: 135 },
  { registrationMark: "RP-C2387", destination: "Clark International Airport", totalEet: "01:30", traineeName: "YOKAI, KENJI H.", instructorName: "SHAUN, ADRIAN F.", departsInMinutes: 160 },
];

const DEPARTED: Array<PreviewFlight & { departedMinutesAgo: number }> = [
  { registrationMark: "RP-C4604", destination: "Laoag International Airport", totalEet: "01:40", traineeName: "JOVES, DENISE R.", instructorName: "SANTOS, JAYPEE R.", departedMinutesAgo: 69 },
  { registrationMark: "RP-C1028", destination: "Vigan", totalEet: "01:20", traineeName: "MALAYAN, CHRISTIAN B.", instructorName: "JOYCE, ANNA L.", departedMinutesAgo: 95 },
  { registrationMark: "RP-C2380", destination: "Binalonan", totalEet: "01:00", traineeName: "DOE, JOHN S.", instructorName: "ZOLDYCK, KILLUA H.", departedMinutesAgo: 10 },
  { registrationMark: "RP-C1990", destination: "Lingayen", totalEet: "00:50", traineeName: "OCAMPO, MIGUEL A.", instructorName: "LAU, MARVIN C.", departedMinutesAgo: 34 },
];

const ARRIVED: Array<PreviewFlight & { departedMinutesAgo: number; arrivedMinutesAgo: number }> = [
  { registrationMark: "RP-C2384", destination: "Binalonan", totalEet: "01:00", traineeName: "OSAYAN, GRACE P.", instructorName: "TONS, RAFAEL D.", departedMinutesAgo: 130, arrivedMinutesAgo: 37 },
  { registrationMark: "RP-C1970", destination: "Baguio", totalEet: "01:10", traineeName: "LIM, PATRICIA C.", instructorName: "GARCIA, RIC S.", departedMinutesAgo: 210, arrivedMinutesAgo: 140 },
];

// Realistic sample board for /monitor-preview: nine on the ground (one
// delayed, enough to page), four airborne (two past EET), two arrived,
// three NOTAMs. Times are relative to now so every state stays true.
export function buildMonitorPreviewBoard(nowMs = Date.now()): MonitorBoard {
  const rows: MonitorFlightRow[] = [
    ...ON_GROUND.map((flight, index) => ({
      aircraftId: `preview-on-ground-${index}`,
      registrationMark: flight.registrationMark,
      section: "on_ground" as const,
      journeyStatus: "scheduled" as const,
      dofAt: at(nowMs, flight.departsInMinutes),
      commencedAt: null,
      terminatedAt: null,
      destination: flight.destination,
      totalEet: flight.totalEet,
      traineeName: flight.traineeName,
      instructorName: flight.instructorName,
    })),
    ...DEPARTED.map((flight, index) => ({
      aircraftId: `preview-departed-${index}`,
      registrationMark: flight.registrationMark,
      section: "departed" as const,
      journeyStatus: "active" as const,
      dofAt: at(nowMs, -flight.departedMinutesAgo - 5),
      commencedAt: at(nowMs, -flight.departedMinutesAgo),
      terminatedAt: null,
      destination: flight.destination,
      totalEet: flight.totalEet,
      traineeName: flight.traineeName,
      instructorName: flight.instructorName,
    })),
    ...ARRIVED.map((flight, index) => ({
      aircraftId: `preview-arrived-${index}`,
      registrationMark: flight.registrationMark,
      section: "arrived" as const,
      journeyStatus: "arrived" as const,
      dofAt: at(nowMs, -flight.departedMinutesAgo - 5),
      commencedAt: at(nowMs, -flight.departedMinutesAgo),
      terminatedAt: at(nowMs, -flight.arrivedMinutesAgo),
      destination: flight.destination,
      totalEet: flight.totalEet,
      traineeName: flight.traineeName,
      instructorName: flight.instructorName,
    })),
  ];

  return {
    rows,
    notams: [
      {
        id: "preview-notam-alert",
        severity: "alert",
        title: "Runway 05/23 closed 1300–1500 local for surface repairs",
        description:
          "All departures and arrivals suspended during the closure window. Aircraft airborne before 1300 must plan to be on the ground by 1245 or divert to Lingayen. Coordinate with the tower before taxi.",
      },
      {
        id: "preview-notam-warning",
        severity: "warning",
        title: "Bird activity reported on final approach RWY 23",
        description:
          "Flocks observed between 0600 and 0900 local near the threshold and the rice fields south of the field. Expect go-around instructions; keep the landing light on during approach.",
      },
      {
        id: "preview-notam-advisory",
        severity: "advisory",
        title: "Fuel bowser out of service until 1500 local",
        description:
          "Refuelling available from the drum stock only. File endurance accordingly and confirm fuel on board with dispatch before commencing.",
      },
    ],
    generatedAt: new Date(nowMs).toISOString(),
  };
}
