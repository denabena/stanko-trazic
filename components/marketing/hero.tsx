"use client";

import { motion } from "motion/react";
import { ArrowRight, Clock, MapPin, TrendingDown } from "lucide-react";

export function Hero({ onStartQuiz }: { onStartQuiz: () => void }) {
  return (
    <section className="bg-[#FAFAFA] pt-6 pb-12 md:pt-10 md:pb-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="mb-5 text-center leading-[1.05] text-[#0A0A0A] lg:mb-6 lg:text-left"
              style={{
                fontSize: "clamp(32px, 5.5vw, 68px)",
                fontWeight: 700,
              }}
            >
              Find out what
              <br />
              your flat will
              <br />
              <span className="text-[#163D73]">actually</span> cost you.
            </h1>
            <p className="mx-auto mb-6 max-w-[480px] text-center text-base leading-relaxed text-[#666666] md:mb-8 md:text-lg lg:mx-0 lg:text-left">
              Enter two or three candidate apartments, your workplace, and how
              you commute. We combine rent, utilities, commute, parking, and a
              neighborhood quality score for Zagreb.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:items-start">
              <motion.button
                type="button"
                onClick={onStartQuiz}
                className="flex items-center justify-center gap-2 rounded bg-[#163D73] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[#1a4682] md:px-8 md:py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start comparing
                <ArrowRight className="size-4" />
              </motion.button>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded border border-[#D1D5DB] bg-transparent px-6 py-3.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#9CA3AF] md:px-8 md:py-4"
              >
                See sample report
              </button>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded border border-[#E5E7EB] bg-white shadow-lg shadow-black/[0.04]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
              transition: { duration: 0.15 },
            }}
          >
            <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] p-4 pb-3 md:p-6 md:pb-4">
              <div className="flex items-center gap-2">
                <div className="relative -top-px size-2 rounded-full bg-[#163D73]" />
                <span
                  className="text-[10px] tracking-[0.2em] text-[#9CA3AF] uppercase"
                  style={{ fontWeight: 500 }}
                >
                  Live comparison
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="mb-5 grid grid-cols-3 gap-3 md:mb-6 md:gap-4">
                {[
                  {
                    icon: TrendingDown,
                    label: "Savings found",
                    value: "€160/mo",
                    color: "#163D73",
                  },
                  {
                    icon: Clock,
                    label: "Commute saved",
                    value: "7 min/day",
                    color: "#666666",
                  },
                  {
                    icon: MapPin,
                    label: "Flats compared",
                    value: "2",
                    color: "#666666",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <stat.icon
                      className="mx-auto mb-1.5 size-4 md:mb-2"
                      style={{ color: stat.color }}
                    />
                    <div
                      className="font-mono text-xs text-[#0A0A0A] md:text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[#9CA3AF] md:text-[10px]">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-0">
                <div className="mb-3 grid grid-cols-3 gap-3 md:gap-4">
                  <div />
                  <div
                    className="truncate text-[11px] text-[#0A0A0A] md:text-xs"
                    style={{ fontWeight: 600 }}
                  >
                    Ilica 42
                  </div>
                  <div
                    className="truncate pl-2 text-[11px] text-[#163D73] md:pl-3 md:text-xs"
                    style={{ fontWeight: 600 }}
                  >
                    Ozaljska 7
                    <span className="relative -top-px ml-1 inline-block rounded-sm bg-[#163D73] px-1 py-0.5 align-middle text-[7px] tracking-wider text-white uppercase md:ml-1.5 md:px-1.5 md:text-[8px]">
                      Best
                    </span>
                  </div>
                </div>
                {[
                  { label: "Monthly Rent", values: ["€950", "€720"] },
                  { label: "Est. Utilities", values: ["€133", "€123"] },
                  { label: "Parking", values: ["€100", "€0"] },
                  { label: "Transport", values: ["€0", "€35"] },
                  { label: "Commute", values: ["12 min", "24 min"] },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-3 border-t border-[#F3F4F6] py-2 md:gap-4 md:py-2.5"
                  >
                    <div className="text-[11px] text-[#9CA3AF] md:text-xs">
                      {row.label}
                    </div>
                    <div className="font-mono text-[11px] text-[#0A0A0A] md:text-xs">
                      {row.values[0]}
                    </div>
                    <div className="pl-2 font-mono text-[11px] text-[#163D73] md:pl-3 md:text-xs">
                      {row.values[1]}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3 border-t-2 border-[#E5E7EB] pt-3 md:gap-4">
                  <div
                    className="text-[11px] text-[#0A0A0A] md:text-xs"
                    style={{ fontWeight: 600 }}
                  >
                    Total
                  </div>
                  <div
                    className="font-mono text-xs text-[#0A0A0A] md:text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    €1,183
                  </div>
                  <div
                    className="pl-2 font-mono text-sm text-[#163D73] md:pl-3"
                    style={{ fontWeight: 700 }}
                  >
                    €878
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
