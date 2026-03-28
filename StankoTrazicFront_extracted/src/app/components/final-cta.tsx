import { motion } from 'motion/react';

export function FinalCTA({ onStartQuiz }: { onStartQuiz: () => void }) {
  return (
    <section className="bg-[#FAFAFA] py-14 md:py-20">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-[#0A0A0A] leading-[1.1] mb-8"
            style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 600 }}
          >
            Stop guessing.<br />Start comparing.
          </h2>
          
          <button
            onClick={onStartQuiz}
            className="px-10 py-4 bg-[#163D73] text-white rounded font-medium hover:bg-[#1a4682] transition-colors text-lg mb-4"
          >
            Take the Quiz
          </button>
          
          <div className="text-[#9CA3AF] text-sm">
            Free. No account required.
          </div>
        </motion.div>
      </div>
    </section>
  );
}