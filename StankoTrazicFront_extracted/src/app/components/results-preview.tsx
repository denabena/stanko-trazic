import { motion } from 'motion/react';

export function ResultsPreview() {
  const apartments = [
    {
      address: 'Ilica 42',
      rent: 950,
      squareMeters: 62,
      utilities: 133,
      transport: 0,
      parking: 100,
      commuteTime: '12 min',
      total: 1183,
    },
    {
      address: 'Ozaljska 7',
      rent: 720,
      squareMeters: 55,
      utilities: 123,
      transport: 35,
      parking: 0,
      commuteTime: '18 min',
      total: 878,
      isWinner: true,
    },
    {
      address: 'Av. V. Holjevca 19',
      rent: 680,
      squareMeters: 68,
      utilities: 142,
      transport: 35,
      parking: 0,
      commuteTime: '32 min',
      total: 857,
    },
  ];

  const rows: { label: string; key: keyof typeof apartments[0] }[] = [
    { label: 'Monthly Rent', key: 'rent' },
    { label: 'Est. Utilities', key: 'utilities' },
    { label: 'Transport Pass', key: 'transport' },
    { label: 'Parking', key: 'parking' },
    { label: 'Commute Time', key: 'commuteTime' },
  ];

  return (
    <section id="results" className="bg-[#FAFAFA] py-14 md:py-20 border-t border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="text-[#9CA3AF] uppercase text-[11px] tracking-[0.15em] mb-8 md:mb-12 text-center">
          RESULTS PREVIEW
        </div>

        {/* Desktop: table layout */}
        <motion.div
          className="hidden md:block bg-white rounded border border-[#E5E7EB] p-8 md:p-12 overflow-x-auto shadow-sm transition-[border-color] duration-300 hover:border-[#163D73]/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', transition: { duration: 0.15 } }}
        >
          {/* Header */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="text-[#9CA3AF] text-xs uppercase tracking-wider">
              Cost Breakdown
            </div>
            {apartments.map((apt) => (
              <div key={apt.address}>
                <div className="text-[#0A0A0A] font-medium text-lg mb-0.5 truncate" title={apt.address}>
                  {apt.address}
                </div>
                <div className="text-[#9CA3AF] text-xs">
                  {apt.squareMeters} m² · €{apt.rent}/mo
                </div>
                {apt.isWinner && (
                  <div className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-[#163D73] text-white text-[10px] uppercase tracking-wider">
                    BEST MATCH
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-0">
            {rows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 gap-6 py-4 ${
                  idx > 0 ? 'border-t border-[#E5E7EB]' : ''
                }`}
              >
                <div className="text-[#666666] text-sm">{row.label}</div>
                {apartments.map((apt) => (
                  <div key={apt.address}>
                    <div className={`font-mono text-sm ${apt.isWinner ? 'text-[#163D73]' : 'text-[#0A0A0A]'}`}>
                      {typeof apt[row.key] === 'number' && row.key !== 'commuteTime'
                        ? `€${apt[row.key]}`
                        : apt[row.key]}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Total Row */}
            <div className="grid grid-cols-4 gap-6 pt-6 border-t-2 border-[#E5E7EB]">
              <div className="text-[#0A0A0A] font-medium">Total Monthly Cost</div>
              {apartments.map((apt) => (
                <div key={apt.address}>
                  <div
                    className={`font-mono text-lg font-medium ${
                      apt.isWinner ? 'text-[#163D73]' : 'text-[#0A0A0A]'
                    }`}
                  >
                    €{apt.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mobile: card layout */}
        <div className="md:hidden space-y-4">
          {apartments.map((apt, i) => (
            <motion.div
              key={apt.address}
              className={`bg-white rounded border p-5 shadow-sm ${
                apt.isWinner ? 'border-[#163D73] ring-1 ring-[#163D73]/10' : 'border-[#E5E7EB]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0A0A0A]" style={{ fontWeight: 600 }}>{apt.address}</span>
                    {apt.isWinner && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-[#163D73] text-white text-[9px] uppercase tracking-wider">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">
                    {apt.squareMeters} m² · €{apt.rent}/mo
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-xl ${apt.isWinner ? 'text-[#163D73]' : 'text-[#0A0A0A]'}`} style={{ fontWeight: 600 }}>
                    €{apt.total}
                  </div>
                  <div className="text-[#9CA3AF] text-[10px]">total/mo</div>
                </div>
              </div>

              {/* Cost rows */}
              <div className="space-y-0">
                {rows.map((row, idx) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-2.5 ${
                      idx > 0 ? 'border-t border-[#F3F4F6]' : ''
                    }`}
                  >
                    <span className="text-[#666666] text-xs">{row.label}</span>
                    <span className={`font-mono text-xs ${apt.isWinner ? 'text-[#163D73]' : 'text-[#0A0A0A]'}`}>
                      {typeof apt[row.key] === 'number' && row.key !== 'commuteTime'
                        ? `€${apt[row.key]}`
                        : apt[row.key]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
