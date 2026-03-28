"use client";

import { motion } from "motion/react";

export function ResultsPreview() {
  const apartments = [
    {
      address: "Ilica 42",
      rent: 950,
      squareMeters: 62,
      utilities: 133,
      transport: 0,
      parking: 100,
      commuteTime: "12 min",
      total: 1183,
    },
    {
      address: "Ozaljska 7",
      rent: 720,
      squareMeters: 55,
      utilities: 123,
      transport: 35,
      parking: 0,
      commuteTime: "18 min",
      total: 878,
      isWinner: true,
    },
    {
      address: "Av. V. Holjevca 19",
      rent: 680,
      squareMeters: 68,
      utilities: 142,
      transport: 35,
      parking: 0,
      commuteTime: "32 min",
      total: 857,
    },
  ];

  const rows: { label: string; key: keyof (typeof apartments)[0] }[] = [
    { label: "Monthly Rent", key: "rent" },
    { label: "Est. Utilities", key: "utilities" },
    { label: "Transport Pass", key: "transport" },
    { label: "Parking", key: "parking" },
    { label: "Commute Time", key: "commuteTime" },
  ];

  return (
    <section
      id="results"
      className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-14 md:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="mb-8 text-center text-[11px] tracking-[0.15em] text-[#9CA3AF] uppercase md:mb-12">
          RESULTS PREVIEW
        </div>

        <motion.div
          className="hidden overflow-x-auto rounded border border-[#E5E7EB] bg-white p-8 shadow-sm transition-[border-color] duration-300 hover:border-[#163D73]/30 md:block md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{
            y: -4,
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
            transition: { duration: 0.15 },
          }}
        >
          <div className="mb-8 grid grid-cols-4 gap-6">
            <div className="text-xs tracking-wider text-[#9CA3AF] uppercase">
              Breakdown
            </div>
            {apartments.map((apt) => (
              <div key={apt.address}>
                <div
                  className="mb-0.5 truncate text-lg font-medium text-[#0A0A0A]"
                  title={apt.address}
                >
                  {apt.address}
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  {apt.squareMeters} m² · €{apt.rent}/mo
                </div>
                {apt.isWinner && (
                  <div className="mt-2 inline-block rounded-sm bg-[#163D73] px-2 py-0.5 text-[10px] tracking-wider text-white uppercase">
                    BEST MATCH
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-0">
            {rows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 gap-6 py-4 ${
                  idx > 0 ? "border-t border-[#E5E7EB]" : ""
                }`}
              >
                <div className="text-sm text-[#666666]">{row.label}</div>
                {apartments.map((apt) => (
                  <div key={apt.address}>
                    <div
                      className={`font-mono text-sm ${apt.isWinner ? "text-[#163D73]" : "text-[#0A0A0A]"}`}
                    >
                      {typeof apt[row.key] === "number" &&
                      row.key !== "commuteTime"
                        ? `€${apt[row.key]}`
                        : String(apt[row.key])}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-4 gap-6 border-t-2 border-[#E5E7EB] pt-6">
              <div className="font-medium text-[#0A0A0A]">
                Total Monthly Cost
              </div>
              {apartments.map((apt) => (
                <div key={apt.address}>
                  <div
                    className={`font-mono text-lg font-medium ${apt.isWinner ? "text-[#163D73]" : "text-[#0A0A0A]"}`}
                  >
                    €{apt.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-4 md:hidden">
          {apartments.map((apt, i) => (
            <motion.div
              key={apt.address}
              className={`rounded border bg-white p-5 shadow-sm ${apt.isWinner ? "border-[#163D73] ring-1 ring-[#163D73]/10" : "border-[#E5E7EB]"}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0A0A0A]" style={{ fontWeight: 600 }}>
                      {apt.address}
                    </span>
                    {apt.isWinner && (
                      <span className="rounded-sm bg-[#163D73] px-1.5 py-0.5 text-[9px] tracking-wider text-white uppercase">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-[#9CA3AF]">
                    {apt.squareMeters} m² · €{apt.rent}/mo
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono text-xl ${apt.isWinner ? "text-[#163D73]" : "text-[#0A0A0A]"}`}
                    style={{ fontWeight: 600 }}
                  >
                    €{apt.total}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">total/mo</div>
                </div>
              </div>

              <div className="space-y-0">
                {rows.map((row, idx) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-2.5 ${
                      idx > 0 ? "border-t border-[#F3F4F6]" : ""
                    }`}
                  >
                    <span className="text-xs text-[#666666]">{row.label}</span>
                    <span
                      className={`font-mono text-xs ${apt.isWinner ? "text-[#163D73]" : "text-[#0A0A0A]"}`}
                    >
                      {typeof apt[row.key] === "number" &&
                      row.key !== "commuteTime"
                        ? `€${apt[row.key]}`
                        : String(apt[row.key])}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
