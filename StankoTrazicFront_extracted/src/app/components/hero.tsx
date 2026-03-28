import { motion } from "motion/react";
import {
  ArrowRight,
  TrendingDown,
  Clock,
  MapPin,
} from "lucide-react";

export function Hero({
  onStartQuiz,
}: {
  onStartQuiz: () => void;
}) {
  return (
    <section className="bg-[#FAFAFA] pt-6 md:pt-10 pb-12 md:pb-20">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-[#0A0A0A] leading-[1.05] mb-5 md:mb-6 text-center lg:text-left"
              style={{
                fontSize: "clamp(32px, 5.5vw, 68px)",
                fontWeight: 700,
              }}
            >
              Find out what
              <br />
              your flat will
              <br />
              <span className="text-[#163D73]">actually</span>
              {" "}cost you.
            </h1>
            <p className="text-[#666666] text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-[480px] text-center lg:text-left mx-auto lg:mx-0">
              Answer a few quick questions and we'll calculate
              rent, commute, parking, and hidden costs for every
              neighborhood in Zagreb.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start">
              <motion.button
                onClick={onStartQuiz}
                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-[#163D73] text-white rounded font-medium hover:bg-[#1a4682] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start comparing
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                onClick={() =>
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 md:px-8 py-3.5 md:py-4 bg-transparent border border-[#D1D5DB] text-[#0A0A0A] rounded font-medium hover:border-[#9CA3AF] transition-colors"
              >
                See sample report
              </button>
            </div>
          </motion.div>

          {/* Right: Preview Card */}
          <motion.div
            className="bg-white rounded border border-[#E5E7EB] shadow-lg shadow-black/[0.04] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
              transition: { duration: 0.15 },
            }}
          >
            <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#163D73] relative -top-[1px]" />
                <span
                  className="text-[#9CA3AF] uppercase text-[10px] tracking-[0.2em]"
                  style={{ fontWeight: 500 }}
                >
                  Live comparison
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
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
                      className="w-4 h-4 mx-auto mb-1.5 md:mb-2"
                      style={{ color: stat.color }}
                    />
                    <div
                      className="text-[#0A0A0A] font-mono text-xs md:text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[#9CA3AF] text-[9px] md:text-[10px] mt-0.5">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Table */}
              <div className="space-y-0">
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-3">
                  <div />
                  <div
                    className="text-[#0A0A0A] text-[11px] md:text-xs truncate"
                    style={{ fontWeight: 600 }}
                  >
                    Ilica 42
                  </div>
                  <div
                    className="text-[#163D73] text-[11px] md:text-xs pl-2 md:pl-3 truncate"
                    style={{ fontWeight: 600 }}
                  >
                    Ozaljska 7
                    <span className="inline-block ml-1 md:ml-1.5 px-1 md:px-1.5 py-0.5 rounded-sm bg-[#163D73] text-white text-[7px] md:text-[8px] uppercase tracking-wider align-middle relative -top-[1px]">Best</span>
                  </div>
                </div>
                {[
                  {
                    label: "Monthly Rent",
                    values: ["€950", "€720"],
                  },
                  {
                    label: "Est. Utilities",
                    values: ["€133", "€123"],
                  },
                  { label: "Parking", values: ["€100", "€0"] },
                  {
                    label: "Transport",
                    values: ["€0", "€35"],
                  },
                  {
                    label: "Commute",
                    values: ["12 min", "24 min"],
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-3 md:gap-4 py-2 md:py-2.5 border-t border-[#F3F4F6]"
                  >
                    <div className="text-[#9CA3AF] text-[11px] md:text-xs">
                      {row.label}
                    </div>
                    <div className="text-[#0A0A0A] text-[11px] md:text-xs font-mono">
                      {row.values[0]}
                    </div>
                    <div className="text-[#163D73] text-[11px] md:text-xs font-mono pl-2 md:pl-3">
                      {row.values[1]}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3 md:gap-4 pt-3 border-t-2 border-[#E5E7EB]">
                  <div
                    className="text-[#0A0A0A] text-[11px] md:text-xs"
                    style={{ fontWeight: 600 }}
                  >
                    Total
                  </div>
                  <div
                    className="text-[#0A0A0A] text-xs md:text-sm font-mono"
                    style={{ fontWeight: 600 }}
                  >
                    €1,183
                  </div>
                  <div
                    className="text-[#163D73] text-xs md:text-sm font-mono pl-2 md:pl-3"
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