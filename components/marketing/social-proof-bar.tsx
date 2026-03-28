"use client";

import { motion } from "motion/react";

export function SocialProofBar() {
  return (
    <section className="border-y border-[#E5E7EB] py-8 md:py-12">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <motion.div
          className="flex items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="hidden h-px flex-1 bg-[#E5E7EB] md:block" />

          <div className="text-sm text-[#666666]">
            Used by{" "}
            <span className="font-medium text-[#0A0A0A]">1,200+</span> Zagreb
            renters this month
          </div>

          <div className="hidden h-px flex-1 bg-[#E5E7EB] md:block" />
        </motion.div>
      </div>
    </section>
  );
}
