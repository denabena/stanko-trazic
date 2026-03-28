"use client";

import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section id="about" className="border-t border-[#E5E7EB] bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-12 text-center text-[11px] tracking-[0.15em] text-[#9CA3AF] uppercase">
            ABOUT
          </div>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-center text-lg leading-relaxed text-[#666666]">
              Stanko Tražić helps renters make informed decisions by calculating
              the{" "}
              <strong className="font-medium text-[#0A0A0A]">
                true monthly cost of living
              </strong>{" "}
              in different Zagreb neighborhoods. We go beyond just rent to
              include utilities, parking, commute costs, and time, giving you a
              complete picture of what your flat will actually cost you each
              month.
            </p>

            <div className="grid gap-8 pt-8 md:grid-cols-2">
              <div className="rounded border border-[#E5E7EB] bg-[#FAFAFA] p-8">
                <h3 className="mb-3 text-lg font-semibold text-[#0A0A0A]">
                  Why we built this
                </h3>
                <p className="text-sm leading-relaxed text-[#666666]">
                  Finding a flat in Zagreb is hard enough. Understanding the true
                  cost shouldn't be. We created this tool to help renters compare
                  neighborhoods based on all the factors that impact monthly
                  expenses.
                </p>
              </div>

              <div className="rounded border border-[#E5E7EB] bg-[#FAFAFA] p-8">
                <h3 className="mb-3 text-lg font-semibold text-[#0A0A0A]">
                  How it helps
                </h3>
                <p className="text-sm leading-relaxed text-[#666666]">
                Our comprehensive calculator factors in monthly rent, estimated utilities, parking costs, public transport passes and commute time to give you a truly accurate comparison across various Zagreb flat locations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
