"use client";

import { motion } from "motion/react";
import { BarChart3, CheckCircle, MessageSquare } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Take a 2-minute quiz",
      description:
        "Tell us about your ideal flat size, budget, commute preferences, and which Zagreb flat locations you're considering.",
    },
    {
      icon: BarChart3,
      title: "We crunch the numbers",
      description:
        "Our algorithm analyzes rent prices, utility estimates, parking costs, public transport, and commute times for each location.",
    },
    {
      icon: CheckCircle,
      title: "Get your personalized report",
      description:
        "See a clear side-by-side comparison of total monthly costs so you can make a confident decision about where to live.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="border-t border-[#E5E7EB] py-14 md:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 text-[11px] tracking-[0.15em] text-[#9CA3AF] uppercase">
            HOW IT WORKS
          </div>
          <h2
            className="text-[#0A0A0A]"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 600 }}
          >
            Three steps to clarity
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((stepItem, idx) => (
            <motion.div
              key={stepItem.title}
              className="group relative rounded border border-[#E5E7EB] bg-[#FAFAFA] p-8 transition-colors hover:border-[#163D73]/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[#163D73]/10">
                  <stepItem.icon className="size-5 text-[#163D73]" />
                </div>
                <span className="font-mono text-xs text-[#D1D5DB]">
                  0{idx + 1}
                </span>
              </div>
              <h3
                className="mb-3 text-lg text-[#0A0A0A]"
                style={{ fontWeight: 600 }}
              >
                {stepItem.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#666666]">
                {stepItem.description}
              </p>

              {idx < 2 && (
                <div className="absolute top-1/2 -right-4 hidden h-px w-8 bg-[#E5E7EB] md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
