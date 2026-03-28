import { motion } from 'motion/react';

export function FeatureCallouts() {
  const features = [
    {
      number: '01',
      title: 'True cost breakdown',
      description:
        'Not just rent. We factor in utilities, parking, commute costs, and time, giving you the full monthly picture.',
    },
    {
      number: '02',
      title: 'Commute calculator',
      description:
        'See how your workplace location impacts daily travel time and costs across Zagreb\'s neighborhoods.',
    },
    {
      number: '03',
      title: 'Neighborhood index',
      description:
        'Compare flats across all major districts with real-time pricing data and cost-of-living adjustments.',
    },
  ];

  return (
    <section className="bg-white py-14 md:py-20 border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 md:divide-x md:divide-[#E5E7EB]">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.number}
              className={`${idx > 0 ? 'md:pl-12' : ''} ${idx < 2 ? 'md:pr-12' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="relative">
                {/* Large background number */}
                <div
                  className="absolute -top-4 left-0 text-[#E5E7EB] opacity-80 select-none pointer-events-none"
                  style={{ fontSize: 'clamp(80px, 10vw, 120px)', fontWeight: 700, lineHeight: 1 }}
                >
                  {feature.number}
                </div>

                {/* Content */}
                <div className="relative pt-20 md:pt-24">
                  <h3 className="text-[#0A0A0A] font-semibold text-xl mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#666666] leading-relaxed">
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