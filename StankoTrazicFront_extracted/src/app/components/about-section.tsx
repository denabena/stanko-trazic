import { motion } from 'motion/react';

export function AboutSection() {
  return (
    <section id="about" className="bg-white py-14 md:py-20 border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[#9CA3AF] uppercase text-[11px] tracking-[0.15em] mb-12 text-center">
            ABOUT
          </div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#666666] text-lg leading-relaxed text-center">
              Stanko Tražić helps renters make informed decisions by calculating the true monthly cost of living in different Zagreb neighborhoods. We go beyond just rent to include utilities, parking, commute costs, and time, giving you a complete picture of what your flat will actually cost you each month.
            </p>

            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <div className="bg-[#FAFAFA] rounded border border-[#E5E7EB] p-8">
                <h3 className="text-[#0A0A0A] font-semibold text-lg mb-3">
                  Why we built this
                </h3>
                <p className="text-[#666666] leading-relaxed text-sm">
                  Finding a flat in Zagreb is hard enough. Understanding the true cost shouldn't be. We created this tool to help renters compare neighborhoods based on all the factors that impact monthly expenses.
                </p>
              </div>

              <div className="bg-[#FAFAFA] rounded border border-[#E5E7EB] p-8">
                <h3 className="text-[#0A0A0A] font-semibold text-lg mb-3">
                  How it helps
                </h3>
                <p className="text-[#666666] leading-relaxed text-sm">
                  Our calculator factors in rent, estimated utilities, parking costs, public transport passes, and commute time to give you an accurate comparison across Zagreb's neighborhoods.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}