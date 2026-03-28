import { motion } from 'motion/react';
import { MessageSquare, BarChart3, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Take a 2-minute quiz',
      description: 'Tell us about your ideal flat size, budget, commute preferences, and which Zagreb neighborhoods you\'re considering.',
    },
    {
      icon: BarChart3,
      title: 'We crunch the numbers',
      description: 'Our algorithm analyzes rent prices, utility estimates, parking costs, public transport, and commute times for each neighborhood.',
    },
    {
      icon: CheckCircle,
      title: 'Get your personalized report',
      description: 'See a clear side-by-side comparison of total monthly costs so you can make a confident decision about where to live.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-14 md:py-20 border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-[#9CA3AF] uppercase text-[11px] tracking-[0.15em] mb-4">
            HOW IT WORKS
          </div>
          <h2 className="text-[#0A0A0A]" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 600 }}>
            Three steps to clarity
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              className="relative bg-[#FAFAFA] rounded border border-[#E5E7EB] p-8 group hover:border-[#163D73]/30 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded bg-[#163D73]/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-[#163D73]" />
                </div>
                <span className="text-[#D1D5DB] font-mono text-xs">0{idx + 1}</span>
              </div>
              <h3 className="text-[#0A0A0A] text-lg mb-3" style={{ fontWeight: 600 }}>
                {step.title}
              </h3>
              <p className="text-[#666666] leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Connector line on desktop */}
              {idx < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-[#E5E7EB]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}