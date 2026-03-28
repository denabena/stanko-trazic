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
              Stanko Tražić estimates the{" "}
              <strong className="font-medium text-[#0A0A0A]">
                real monthly cost
              </strong>{" "}
              of a few candidate apartments in Zagreb: rent, utilities from
              square meters, commute from your mode and destination, parking
              where we can resolve a zone, and a simple neighborhood quality
              score from nearby amenities.
            </p>

            <div className="grid gap-8 pt-8 md:grid-cols-2">
              <div className="rounded border border-[#E5E7EB] bg-[#FAFAFA] p-8">
                <h3 className="mb-3 text-lg font-semibold text-[#0A0A0A]">
                  Why we built this
                </h3>
                <p className="text-sm leading-relaxed text-[#666666]">
                  Rent listings rarely show the full picture. Commute passes,
                  parking, and what is walkable nearby change what you actually
                  spend and how it feels to live there—so we put those pieces in
                  one comparison.
                </p>
              </div>

              <div className="rounded border border-[#E5E7EB] bg-[#FAFAFA] p-8">
                <h3 className="mb-3 text-lg font-semibold text-[#0A0A0A]">
                  How it helps
                </h3>
                <p className="text-sm leading-relaxed text-[#666666]">
                  You keep the same layout of questions the product uses
                  internally: apartment candidates, a work or university
                  destination, transit mode, and whether you care most about
                  total cost, commute time, or neighborhood quality.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
