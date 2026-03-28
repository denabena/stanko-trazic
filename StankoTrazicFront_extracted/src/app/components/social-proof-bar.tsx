import { motion } from 'motion/react';

export function SocialProofBar() {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 border-y border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <motion.div 
          className="flex items-center justify-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Left line */}
          <div className="hidden md:block flex-1 h-[1px] bg-[#E5E7EB]" />
          
          {/* Text */}
          <div className="text-[#666666] text-sm">
            Used by <span className="text-[#0A0A0A] font-medium">1,200+</span> Zagreb renters this month
          </div>
          
          {/* Right line */}
          <div className="hidden md:block flex-1 h-[1px] bg-[#E5E7EB]" />
        </motion.div>
      </div>
    </section>
  );
}