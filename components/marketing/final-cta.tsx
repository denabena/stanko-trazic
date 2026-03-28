"use client";

import { motion } from "motion/react";

export function FinalCTA({ onStartQuiz }: { onStartQuiz: () => void }) {
  return (
    <section className="bg-[#FAFAFA] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="mb-8 leading-[1.1] text-[#0A0A0A]"
            style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 600 }}
          >
            Stop guessing.
            <br />
            Start comparing.
          </h2>

          <button
            type="button"
            onClick={onStartQuiz}
            className="mb-4 rounded bg-[#163D73] px-10 py-4 text-lg font-medium text-white transition-colors hover:bg-[#1a4682]"
          >
            Take the quiz
          </button>

          <div className="text-sm text-[#9CA3AF]">
            Free. No account required.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
