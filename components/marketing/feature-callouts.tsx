"use client";

import { motion } from "motion/react";

export function FeatureCallouts() {
  const features = [
    {
      number: "01",
      title: "True cost breakdown",
      description:
        "Not just rent. We factor in utilities, parking, commute costs, and time, giving you the full monthly picture.",
    },
    {
      number: "02",
      title: "Commute calculator",
      description:
        "See how your workplace location impacts daily travel time and costs across locations.",
    },
    {
      number: "03",
      title: "Neighborhood index",
      description:
        "Compare flats across all major districts with real-time pricing data and cost-of-living adjustments.",
    },
  ];

  return (
    <section className="border-t border-[#E5E7EB] bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12 md:divide-x md:divide-[#E5E7EB]">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.number}
              className={`${idx > 0 ? "md:pl-12" : ""} ${idx < 2 ? "md:pr-12" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="relative">
                <div
                  className="pointer-events-none absolute -top-4 left-0 select-none text-[#E5E7EB] opacity-80"
                  style={{
                    fontSize: "clamp(80px, 10vw, 120px)",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {feature.number}
                </div>

                <div className="relative pt-20 md:pt-24">
                  <h3 className="mb-3 text-xl font-semibold text-[#0A0A0A]">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-[#666666]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
