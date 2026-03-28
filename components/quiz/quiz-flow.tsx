"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  CheckCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { AnimatedBackground } from "@/components/animated-background";
import { StankoLogo } from "@/components/stanko-logo";
import {
  LOCAL_STORAGE_COMPARISON_SESSION_KEY,
  MAX_APARTMENT_CANDIDATES,
  MIN_APARTMENT_CANDIDATES,
} from "@/constants/index";
import { runStankoComparison } from "@/lib/run-stanko-comparison-client";
import { postGeminiComparisonSummary } from "@/lib/stanko-api-client";
import type {
  ApartmentCandidate,
  ApartmentEntryStepState,
  ApartmentMonthlyRealCostBreakdown,
  ComparisonWinnerInsight,
  GeminiComparisonSummaryRequest,
  PersistedComparisonSession,
  TransitMode,
  TransitPriorityQuizAnswers,
  UserPriority,
  WorkOrUniversityDestination,
} from "@/lib/types";

const TOTAL_STEPS = 2;

type DraftApartment = {
  id: string;
  addressLine: string;
  rentEurosPerMonth: number | "";
  squareMeters: number | "";
};

type QuizDraft = {
  apartments: DraftApartment[];
  destination: WorkOrUniversityDestination;
  transitMode: TransitMode | "";
  priority: UserPriority | "";
};

function newApartmentId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `apt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const emptyApartment = (): DraftApartment => ({
  id: newApartmentId(),
  addressLine: "",
  rentEurosPerMonth: "",
  squareMeters: "",
});

const transitOptions: { value: TransitMode; label: string; icon: string }[] = [
  { value: "car", label: "Car", icon: "🚗" },
  { value: "tram_bus", label: "Tram / Bus", icon: "🚌" },
  { value: "zagreb_bike", label: "Zagreb Bajs", icon: "🚲" },
  { value: "walk", label: "Walking", icon: "🚶" },
];

const priorityOptions: {
  value: UserPriority;
  label: string;
  description: string;
}[] = [
  {
    value: "lowest_monthly_total",
    label: "Lowest monthly total",
    description: "Minimize rent, utilities, commute, and parking combined",
  },
  {
    value: "shortest_commute",
    label: "Shortest commute",
    description: "Prioritize the shortest door-to-door travel time",
  },
  {
    value: "best_neighborhood_quality",
    label: "Best neighborhood quality",
    description: "Weight shops, parks, pharmacies, and cafés nearby",
  },
];

function sortBreakdowns(
  rows: ApartmentMonthlyRealCostBreakdown[],
  priority: UserPriority,
): ApartmentMonthlyRealCostBreakdown[] {
  const copy = [...rows];
  if (priority === "shortest_commute") {
    copy.sort((a, b) => a.commuteDurationMinutes - b.commuteDurationMinutes);
  } else if (priority === "best_neighborhood_quality") {
    copy.sort(
      (a, b) => b.qualityOfLifeScoreOutOf100 - a.qualityOfLifeScoreOutOf100,
    );
  } else {
    copy.sort((a, b) => a.totalEurosPerMonth - b.totalEurosPerMonth);
  }
  return copy;
}

function LoadingPhase({ message }: { message: string }) {
  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-2 border-[#163D73]/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#163D73]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#163D73]/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="text-sm text-[#666666]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

function ResultsPhase({
  sortedRows,
  addressById,
  winner,
  priority,
  errors,
  narrative,
  onDone,
}: {
  sortedRows: ApartmentMonthlyRealCostBreakdown[];
  addressById: Map<string, string>;
  winner: ComparisonWinnerInsight | null;
  priority: UserPriority;
  errors: string[];
  narrative: string | null;
  onDone: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const winnerId = winner?.winnerApartmentId ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {errors.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="mb-2 font-medium">Notes from this run</p>
          <ul className="list-inside list-disc space-y-1 text-amber-900/90">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {sortedRows.length === 0 ? (
        <p className="text-center text-sm text-[#666666]">
          We could not compute any apartment rows. Check addresses and API
          keys, then try again.
        </p>
      ) : null}

      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#163D73]/10 px-4 py-2 text-sm text-[#163D73]"
        >
          <Sparkles className="size-4" />
          {showBreakdown ? "Cost breakdown" : "Your personalized results"}
        </motion.div>
        <h3 className="text-2xl text-[#0A0A0A]" style={{ fontWeight: 600 }}>
          {showBreakdown ? "Full cost breakdown" : "Best apartments for you"}
        </h3>
        <p className="mt-2 text-xs text-[#9CA3AF]">
          Ranked by{" "}
          {priority === "shortest_commute"
            ? "shortest commute"
            : priority === "best_neighborhood_quality"
              ? "neighborhood quality score"
              : "lowest total monthly cost"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showBreakdown ? (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] gap-2 border-b border-[#E5E7EB] pb-2 text-[10px] uppercase tracking-wider text-[#9CA3AF]">
              <div>Apartment</div>
              <div className="text-right">Rent</div>
              <div className="text-right">Utils</div>
              <div className="text-right">Commute</div>
              <div className="text-right">Park</div>
              <div className="text-right">Total</div>
            </div>
            {sortedRows.map((r, i) => {
              const name =
                addressById.get(r.apartmentId) ?? r.apartmentId.slice(0, 8);
              const isWin = winnerId !== null && r.apartmentId === winnerId;
              return (
                <motion.div
                  key={r.apartmentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`grid grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] items-center gap-2 border-b border-[#F3F4F6] py-3 ${isWin ? "-mx-2 rounded bg-[#163D73]/[0.02] px-2" : ""}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {isWin && (
                        <div className="size-1.5 rounded-full bg-[#163D73]" />
                      )}
                      <span
                        className="truncate text-sm text-[#0A0A0A]"
                        style={{ fontWeight: isWin ? 600 : 400 }}
                      >
                        {name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[#9CA3AF]">
                      {r.commuteDurationMinutes} min · QoL{" "}
                      {r.qualityOfLifeScoreOutOf100}
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm text-[#0A0A0A]">
                    €{Math.round(r.rentEurosPerMonth)}
                  </div>
                  <div className="text-right font-mono text-sm text-[#666666]">
                    €{Math.round(r.utilitiesEurosPerMonth)}
                  </div>
                  <div className="text-right font-mono text-sm text-[#666666]">
                    €{Math.round(r.commuteEurosPerMonth)}
                  </div>
                  <div className="text-right font-mono text-sm text-[#666666]">
                    €{Math.round(r.parkingEurosPerMonth)}
                  </div>
                  <div
                    className="text-right font-mono text-sm text-[#0A0A0A]"
                    style={{ fontWeight: 600 }}
                  >
                    €{Math.round(r.totalEurosPerMonth)}
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 pt-4"
            >
              <button
                type="button"
                onClick={() => setShowBreakdown(false)}
                className="flex-1 cursor-pointer rounded border border-[#D1D5DB] px-6 py-3.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#9CA3AF]"
              >
                Back to results
              </button>
              <button
                type="button"
                onClick={onDone}
                className="cursor-pointer rounded bg-[#163D73] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[#1a4682]"
              >
                Back to home
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-3">
              {sortedRows.map((r, i) => {
                const name =
                  addressById.get(r.apartmentId) ?? r.apartmentId.slice(0, 8);
                const isWin = winnerId !== null && r.apartmentId === winnerId;
                return (
                  <motion.div
                    key={r.apartmentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    className={`relative overflow-hidden rounded border p-5 ${isWin ? "border-[#163D73] bg-[#163D73]/[0.03]" : "border-[#E5E7EB] bg-white"}`}
                  >
                    {isWin && (
                      <div className="absolute top-0 right-0 rounded-bl bg-[#163D73] px-3 py-1 text-[10px] tracking-wider text-white uppercase">
                        Best match
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-mono text-xs text-[#9CA3AF]">
                            #{i + 1}
                          </span>
                          <span
                            className="max-w-[200px] truncate text-[#0A0A0A]"
                            style={{ fontWeight: 600 }}
                          >
                            {name}
                          </span>
                        </div>
                        <div className="text-sm text-[#666666]">
                          {r.commuteDurationMinutes} min commute · QoL{" "}
                          {r.qualityOfLifeScoreOutOf100}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-mono text-xl text-[#0A0A0A]"
                          style={{ fontWeight: 600 }}
                        >
                          €{Math.round(r.totalEurosPerMonth)}
                        </div>
                        <div className="text-xs text-[#666666]">per month</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {narrative ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 overflow-hidden rounded-lg border border-[#163D73]/15 bg-gradient-to-br from-[#163D73]/[0.04] to-transparent"
              >
                <div className="flex items-center gap-2 border-b border-[#163D73]/10 px-5 py-3">
                  <Sparkles className="size-3.5 text-[#163D73]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#163D73]">
                    AI insight
                  </span>
                </div>
                <div className="px-5 py-4 text-sm leading-relaxed text-[#0A0A0A]">
                  {(() => {
                    const lines = narrative.split("\n").filter((l) => l.trim());
                    const bullets: string[] = [];
                    const intro: string[] = [];
                    for (const line of lines) {
                      const m = line.match(/^\s*[-*•]\s+(.+)/);
                      if (m) bullets.push(m[1]);
                      else if (bullets.length === 0) intro.push(line.trim());
                    }
                    return (
                      <>
                        {intro.length > 0 && (
                          <p className="mb-3">{intro.join(" ")}</p>
                        )}
                        {bullets.length > 0 && (
                          <ul className="space-y-2.5">
                            {bullets.map((b, i) => (
                              <li key={i} className="flex gap-2.5">
                                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#163D73]/10 text-[10px] font-bold text-[#163D73]">
                                  {i + 1}
                                </span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    );
                  })()}
                </div>
                {winner && sortedRows.length >= 2 && (
                  <div className="grid grid-cols-3 gap-px border-t border-[#163D73]/10 bg-[#163D73]/10">
                    <div className="bg-white px-4 py-3 text-center">
                      <div className="font-mono text-sm font-semibold text-[#163D73]">
                        €{Math.round(winner.monthlyTotalDifferenceEuros)}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                        saved vs runner-up
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3 text-center">
                      <div className="font-mono text-sm font-semibold text-[#163D73]">
                        {winner.dailyCommuteMinutesSavedVersusRunnerUp} min
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                        commute edge/day
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3 text-center">
                      <div className="font-mono text-sm font-semibold text-[#163D73]">
                        {winner.qualityOfLifeScoreDifferenceVersusRunnerUp > 0 ? "+" : ""}
                        {winner.qualityOfLifeScoreDifferenceVersusRunnerUp}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                        QoL score edge
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : winner && sortedRows.length >= 2 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[#E5E7EB] px-4 py-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#163D73]">
                    €{Math.round(winner.monthlyTotalDifferenceEuros)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    saved vs runner-up
                  </div>
                </div>
                <div className="rounded-lg border border-[#E5E7EB] px-4 py-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#163D73]">
                    {winner.dailyCommuteMinutesSavedVersusRunnerUp} min
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    commute edge/day
                  </div>
                </div>
                <div className="rounded-lg border border-[#E5E7EB] px-4 py-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#163D73]">
                    {winner.qualityOfLifeScoreDifferenceVersusRunnerUp > 0 ? "+" : ""}
                    {winner.qualityOfLifeScoreDifferenceVersusRunnerUp}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    QoL score edge
                  </div>
                </div>
              </div>
            ) : null}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 pt-6"
            >
              <button
                type="button"
                onClick={() => setShowBreakdown(true)}
                className="flex-1 cursor-pointer rounded bg-[#163D73] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[#1a4682]"
              >
                View full breakdown
              </button>
              <button
                type="button"
                onClick={onDone}
                className="cursor-pointer rounded border border-[#D1D5DB] px-6 py-3.5 font-medium text-[#666666] transition-colors hover:border-[#9CA3AF]"
              >
                Back to home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function parsePersisted(raw: string | null): Partial<PersistedComparisonSession> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (typeof v !== "object" || v === null) return null;
    return v as Partial<PersistedComparisonSession>;
  } catch {
    return null;
  }
}

export function QuizFlow() {
  const router = useRouter();
  const sessionTokenRef = useRef("");
  useEffect(() => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = newApartmentId();
    }
  }, []);

  const goHome = () => {
    router.push("/");
    window.scrollTo(0, 0);
  };

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizDraft>(() => ({
    apartments: [emptyApartment(), emptyApartment()],
    destination: { label: "", placeIdOrAddress: "" },
    transitMode: "",
    priority: "",
  }));

  const [comparisonEntry, setComparisonEntry] =
    useState<ApartmentEntryStepState | null>(null);
  const [comparisonQuiz, setComparisonQuiz] =
    useState<TransitPriorityQuizAnswers | null>(null);
  const [breakdowns, setBreakdowns] = useState<ApartmentMonthlyRealCostBreakdown[]>(
    [],
  );
  const [winner, setWinner] = useState<ComparisonWinnerInsight | null>(null);
  const [runErrors, setRunErrors] = useState<string[]>([]);
  const [narrative, setNarrative] = useState<string | null>(null);

  const loadingMessages = [
    "Calling Maps for commute times…",
    "Scoring neighborhood amenities…",
    "Looking up parking zones…",
    "Building your comparison…",
  ];
  const [loadingMsg, setLoadingMsg] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsg((p) => (p + 1) % loadingMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const parsed = parsePersisted(
      localStorage.getItem(LOCAL_STORAGE_COMPARISON_SESSION_KEY),
    );
    if (!parsed?.apartmentEntry || !parsed.quiz) return;
    const { apartmentEntry, quiz } = parsed;
    const drafts: DraftApartment[] = apartmentEntry.apartments.map((a) => ({
      id: a.id || newApartmentId(),
      addressLine: a.addressLine,
      rentEurosPerMonth: a.rentEurosPerMonth,
      squareMeters: a.squareMeters,
    }));
    while (drafts.length < MIN_APARTMENT_CANDIDATES) {
      drafts.push(emptyApartment());
    }
    setAnswers({
      apartments: drafts.slice(0, MAX_APARTMENT_CANDIDATES),
      destination: { ...apartmentEntry.destination },
      transitMode: quiz.transitMode,
      priority: quiz.priority,
    });
  }, []);

  const updateApartment = (
    index: number,
    field: keyof Omit<DraftApartment, "id">,
    value: string,
  ) => {
    setAnswers((prev) => {
      const updated = [...prev.apartments];
      if (field === "rentEurosPerMonth" || field === "squareMeters") {
        updated[index] = {
          ...updated[index],
          [field]: value === "" ? "" : Number(value),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, apartments: updated };
    });
  };

  const addApartment = () => {
    if (answers.apartments.length < MAX_APARTMENT_CANDIDATES) {
      setAnswers((prev) => ({
        ...prev,
        apartments: [...prev.apartments, emptyApartment()],
      }));
    }
  };

  const removeApartment = (index: number) => {
    if (answers.apartments.length > MIN_APARTMENT_CANDIDATES) {
      setAnswers((prev) => ({
        ...prev,
        apartments: prev.apartments.filter((_, i) => i !== index),
      }));
    }
  };

  const validApartments: ApartmentCandidate[] = useMemo(() => {
    return answers.apartments
      .filter(
        (a) =>
          a.addressLine.trim() !== "" &&
          a.rentEurosPerMonth !== "" &&
          a.squareMeters !== "" &&
          Number(a.rentEurosPerMonth) >= 0 &&
          Number(a.squareMeters) > 0,
      )
      .map((a) => ({
        id: a.id,
        addressLine: a.addressLine.trim(),
        rentEurosPerMonth: Number(a.rentEurosPerMonth),
        squareMeters: Number(a.squareMeters),
      }));
  }, [answers.apartments]);

  const canProceed = useCallback(() => {
    if (step === 0) {
      return (
        validApartments.length >= MIN_APARTMENT_CANDIDATES &&
        answers.destination.label.trim() !== "" &&
        answers.destination.placeIdOrAddress.trim() !== ""
      );
    }
    if (step === 1) {
      return answers.transitMode !== "" && answers.priority !== "";
    }
    return false;
  }, [step, validApartments.length, answers.destination, answers.transitMode, answers.priority]);

  const runComparison = async () => {
    if (
      answers.transitMode === "" ||
      answers.priority === "" ||
      validApartments.length < MIN_APARTMENT_CANDIDATES
    ) {
      return;
    }
    const destLabel = answers.destination.label.trim();
    const destPlace = answers.destination.placeIdOrAddress.trim();
    const destDesc = answers.destination.placeDescription?.trim();
    const entry: ApartmentEntryStepState = {
      apartments: validApartments,
      destination: {
        label: destLabel,
        placeIdOrAddress: destPlace,
        ...(destDesc
          ? { placeDescription: destDesc }
          : {}),
      },
    };
    const quiz: TransitPriorityQuizAnswers = {
      transitMode: answers.transitMode,
      priority: answers.priority,
    };
    const persisted: PersistedComparisonSession = {
      apartmentEntry: entry,
      quiz,
      savedAtIso: new Date().toISOString(),
    };
    try {
      localStorage.setItem(
        LOCAL_STORAGE_COMPARISON_SESSION_KEY,
        JSON.stringify(persisted),
      );
    } catch {
      /* ignore quota */
    }

    setIsLoading(true);
    setRunErrors([]);
    setNarrative(null);
    const result = await runStankoComparison(entry, quiz);
    setComparisonEntry(entry);
    setComparisonQuiz(quiz);
    setBreakdowns(result.breakdowns);
    setWinner(result.winner);
    setRunErrors(result.errors);

    if (result.breakdowns.length >= 2 && result.winner) {
      const addressById = new Map(
        entry.apartments.map((a) => [a.id, a.addressLine] as const),
      );
      const sorted = sortBreakdowns(result.breakdowns, quiz.priority);
      const winnerRow = sorted[0];
      const runnerRow = sorted[1];
      if (winnerRow && runnerRow) {
        const label = (id: string) =>
          addressById.get(id)?.trim() || id.slice(0, 8);
        const gemPayload: GeminiComparisonSummaryRequest = {
          priority: quiz.priority,
          apartments: sorted.map((r) => ({
            addressLine: label(r.apartmentId),
            rentEurosPerMonth: r.rentEurosPerMonth,
            utilitiesEurosPerMonth: r.utilitiesEurosPerMonth,
            commuteEurosPerMonth: r.commuteEurosPerMonth,
            parkingEurosPerMonth: r.parkingEurosPerMonth,
            totalEurosPerMonth: r.totalEurosPerMonth,
            commuteDurationMinutes: r.commuteDurationMinutes,
            qualityOfLifeScoreOutOf100: r.qualityOfLifeScoreOutOf100,
          })),
          winnerAddress: label(winnerRow.apartmentId),
          runnerUpAddress: label(runnerRow.apartmentId),
          monthlyTotalDifferenceEuros:
            result.winner.monthlyTotalDifferenceEuros,
          dailyCommuteMinutesSavedVersusRunnerUp:
            result.winner.dailyCommuteMinutesSavedVersusRunnerUp,
          qualityOfLifeScoreDifferenceVersusRunnerUp:
            result.winner.qualityOfLifeScoreDifferenceVersusRunnerUp,
        };
        const gem = await postGeminiComparisonSummary(gemPayload);
        if (gem.ok) setNarrative(gem.data.plainLanguageSummary);
      }
    }

    setIsLoading(false);
    setShowResults(true);
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      void runComparison();
    }
  };

  const prev = () => {
    if (step > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const sortedRows = useMemo(() => {
    if (!comparisonQuiz || breakdowns.length === 0) return [];
    return sortBreakdowns(breakdowns, comparisonQuiz.priority);
  }, [breakdowns, comparisonQuiz]);

  const addressById = useMemo(() => {
    const m = new Map<string, string>();
    comparisonEntry?.apartments.forEach((a) => m.set(a.id, a.addressLine));
    return m;
  }, [comparisonEntry]);

  const stepTitles = [
    "Which apartments are you eyeing?",
    "How do you get around?",
  ];
  const stepSubtitles = [
    "Add the places you're deciding between — we'll do the math on all the hidden costs.",
    "Pick your daily commute style and tell us what matters most to you.",
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <AnimatedBackground />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3 md:px-20 md:py-4">
            <button
              type="button"
              onClick={goHome}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-[#666666] transition-colors hover:text-[#0A0A0A] md:gap-2 md:text-sm"
            >
              <ArrowUpLeft className="size-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <StankoLogo className="size-6 md:size-7" />
              <span
                className="text-xs text-[#0A0A0A] md:text-sm"
                style={{ fontWeight: 500 }}
              >
                Stanko Tražić
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-20 md:py-16">
          {!isLoading && !showResults && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">
                  Step {step + 1} of {TOTAL_STEPS}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  {Math.round(((step + 1) / TOTAL_STEPS) * 100)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#163D73] to-[#2563A8]"
                  animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingPhase
                key="loading"
                message={loadingMessages[loadingMsg] ?? loadingMessages[0]}
              />
            ) : showResults && comparisonQuiz ? (
              <ResultsPhase
                key="results"
                sortedRows={sortedRows}
                addressById={addressById}
                winner={winner}
                priority={comparisonQuiz.priority}
                errors={runErrors}
                narrative={narrative}
                onDone={goHome}
              />
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2
                    className="mb-2 text-2xl text-[#0A0A0A] md:text-3xl"
                    style={{ fontWeight: 600 }}
                  >
                    {stepTitles[step]}
                  </h2>
                  <p className="text-sm text-[#9CA3AF] md:text-base">
                    {stepSubtitles[step]}
                  </p>
                </div>

                {step === 0 && (
                  <div className="space-y-6">
                    {answers.apartments.map((apt, i) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="space-y-4 overflow-hidden rounded-lg border border-[#E5E7EB] border-l-[3px] border-l-[#163D73] bg-white p-5 shadow-sm md:p-6"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm text-[#0A0A0A]"
                            style={{ fontWeight: 600 }}
                          >
                            Apartment {i + 1}
                          </span>
                          {answers.apartments.length >
                            MIN_APARTMENT_CANDIDATES && (
                            <button
                              type="button"
                              onClick={() => removeApartment(i)}
                              className="p-1 text-[#9CA3AF] transition-colors hover:text-red-500"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`apt-addr-${apt.id}`}
                            className="mb-1.5 block text-xs text-[#666666]"
                          >
                            Street address
                          </label>
                          <AddressAutocompleteInput
                            id={`apt-addr-${apt.id}`}
                            value={apt.addressLine}
                            onChange={(v) => updateApartment(i, "addressLine", v)}
                            sessionToken={
                              sessionTokenRef.current || undefined
                            }
                            placeholder="e.g. Ilica 42, Zagreb"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor={`apt-rent-${apt.id}`}
                              className="mb-1.5 block text-xs text-[#666666]"
                            >
                              Monthly rent{" "}
                              <span className="text-[#9CA3AF]">(€/mo)</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[#9CA3AF]">
                                €
                              </span>
                              <input
                                id={`apt-rent-${apt.id}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                placeholder="750"
                                value={apt.rentEurosPerMonth}
                                onChange={(e) =>
                                  updateApartment(
                                    i,
                                    "rentEurosPerMonth",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded border border-[#E5E7EB] bg-white py-2.5 pr-3 pl-8 font-mono text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] transition-colors focus:border-[#163D73] focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor={`apt-sqm-${apt.id}`}
                              className="mb-1.5 block text-xs text-[#666666]"
                            >
                              Size{" "}
                              <span className="text-[#9CA3AF]">(m²)</span>
                            </label>
                            <div className="relative">
                              <input
                                id={`apt-sqm-${apt.id}`}
                                type="number"
                                inputMode="numeric"
                                min={1}
                                step={1}
                                placeholder="55"
                                value={apt.squareMeters}
                                onChange={(e) =>
                                  updateApartment(
                                    i,
                                    "squareMeters",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded border border-[#E5E7EB] bg-white py-2.5 pr-9 pl-3 font-mono text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] transition-colors focus:border-[#163D73] focus:outline-none"
                              />
                              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#9CA3AF]">
                                m²
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {answers.apartments.length < MAX_APARTMENT_CANDIDATES && (
                      <button
                        type="button"
                        onClick={addApartment}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D1D5DB] py-4 text-sm text-[#666666] transition-all hover:border-[#163D73] hover:bg-[#163D73]/[0.02] hover:text-[#163D73]"
                      >
                        <Plus className="size-4" />
                        Add a 3rd apartment
                      </button>
                    )}

                    <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm md:p-6">
                      <div className="mb-5">
                        <span
                          className="text-sm text-[#0A0A0A]"
                          style={{ fontWeight: 600 }}
                        >
                          Where do you work or study?
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="dest-label"
                            className="mb-1.5 block text-xs text-[#666666]"
                          >
                            Name
                          </label>
                          <input
                            id="dest-label"
                            type="text"
                            placeholder="e.g. FER Zagreb"
                            value={answers.destination.label}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                destination: {
                                  ...prev.destination,
                                  label: e.target.value,
                                },
                              }))
                            }
                            className="w-full rounded border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] transition-colors focus:border-[#163D73] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="dest-place"
                            className="mb-1.5 block text-xs text-[#666666]"
                          >
                            Address or place
                          </label>
                          <AddressAutocompleteInput
                            id="dest-place"
                            showMapPin={false}
                            value={
                              answers.destination.placeDescription ??
                              answers.destination.placeIdOrAddress
                            }
                            onChange={(v) =>
                              setAnswers((prev) => ({
                                ...prev,
                                destination: {
                                  ...prev.destination,
                                  placeIdOrAddress: v,
                                  placeDescription: v,
                                },
                              }))
                            }
                            onPickSuggestion={(s) => {
                              setAnswers((prev) => ({
                                ...prev,
                                destination: {
                                  ...prev.destination,
                                  placeIdOrAddress: s.placeId,
                                  placeDescription: s.description,
                                },
                              }));
                            }}
                            sessionToken={
                              sessionTokenRef.current || undefined
                            }
                            placeholder="Search address or pick a suggestion"
                            inputClassName="pl-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-10">
                    <div id="transit-mode-group">
                      <label
                        className="mb-4 block text-sm text-[#0A0A0A]"
                        style={{ fontWeight: 500 }}
                      >
                        How will you commute?
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {transitOptions.map((opt, i) => (
                          <motion.button
                            key={opt.value}
                            type="button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                transitMode: opt.value,
                              }))
                            }
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 px-3 py-5 text-center shadow-sm transition-all sm:py-6 ${
                              answers.transitMode === opt.value
                                ? "border-[#163D73] bg-[#163D73]/[0.06] text-[#0A0A0A] shadow-[#163D73]/10"
                                : "border-[#E5E7EB] bg-white text-[#666666] hover:border-[#D1D5DB] hover:shadow-md"
                            }`}
                          >
                            <span className="text-2xl sm:text-3xl">
                              {opt.icon}
                            </span>
                            <span
                              className="text-xs"
                              style={{ fontWeight: 500 }}
                            >
                              {opt.label}
                            </span>
                            {answers.transitMode === opt.value && (
                              <CheckCircle className="size-4 text-[#163D73]" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div id="priority-group">
                      <label
                        className="mb-4 block text-sm text-[#0A0A0A]"
                        style={{ fontWeight: 500 }}
                      >
                        What matters most?
                      </label>
                      <div className="space-y-3">
                        {priorityOptions.map((opt, i) => (
                          <motion.button
                            key={opt.value}
                            type="button"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06 }}
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                priority: opt.value,
                              }))
                            }
                            whileTap={{ scale: 0.98 }}
                            className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 px-5 py-5 text-left shadow-sm transition-all ${
                              answers.priority === opt.value
                                ? "border-[#163D73] bg-[#163D73]/[0.06] shadow-[#163D73]/10"
                                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-md"
                            }`}
                          >
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                answers.priority === opt.value
                                  ? "border-[#163D73] bg-[#163D73]"
                                  : "border-[#D1D5DB]"
                              }`}
                            >
                              {answers.priority === opt.value && (
                                <CheckCircle className="size-3.5 text-white" />
                              )}
                            </div>
                            <div>
                              <div
                                className="text-sm text-[#0A0A0A]"
                                style={{ fontWeight: 500 }}
                              >
                                {opt.label}
                              </div>
                              <div className="mt-0.5 text-xs text-[#9CA3AF]">
                                {opt.description}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between border-t border-[#E5E7EB] pt-6">
                  <button
                    type="button"
                    onClick={step === 0 ? goHome : prev}
                    className="flex cursor-pointer items-center gap-2 rounded px-4 py-2.5 text-sm text-[#666666] transition-colors hover:bg-[#F3F4F6] hover:text-[#0A0A0A]"
                  >
                    <ArrowLeft className="size-4" />
                    {step === 0 ? "Cancel" : "Back"}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canProceed()}
                    className={`flex cursor-pointer items-center gap-2 rounded px-6 py-2.5 text-sm font-medium transition-all ${
                      canProceed()
                        ? "bg-[#163D73] text-white hover:bg-[#1a4682]"
                        : "bg-[#E5E7EB] text-[#9CA3AF]"
                    }`}
                  >
                    {step === TOTAL_STEPS - 1 ? "See results" : "Continue"}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
