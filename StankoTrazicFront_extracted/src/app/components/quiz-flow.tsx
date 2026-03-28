import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Plus, Trash2, Sparkles, MapPin, Navigation, CheckCircle, ArrowUpLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AnimatedBackground } from './animated-background';
import logo from 'figma:asset/917aa83a6589d3e628579bf9fe58ef8b347648ef.png';

// --- Data model types ---

interface ApartmentCandidate {
  addressLine: string;
  rentEurosPerMonth: number | '';
  squareMeters: number | '';
}

interface WorkOrUniversityDestination {
  label: string;
  placeIdOrAddress: string;
}

type TransitMode = 'car' | 'tram_bus' | 'zagreb_bike' | 'walk';
type Priority = 'lowest_monthly_total' | 'shortest_commute' | 'best_neighborhood_quality';

interface Answers {
  apartments: ApartmentCandidate[];
  destination: WorkOrUniversityDestination;
  transitMode: TransitMode | '';
  priority: Priority | '';
}

const TOTAL_STEPS = 2;

const emptyApartment = (): ApartmentCandidate => ({
  addressLine: '',
  rentEurosPerMonth: '',
  squareMeters: '',
});

const transitOptions: { value: TransitMode; label: string; icon: string }[] = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'tram_bus', label: 'Tram / Bus', icon: '🚌' },
  { value: 'zagreb_bike', label: 'Zagreb Bajs', icon: '🚲' },
  { value: 'walk', label: 'Walking', icon: '🚶' },
];

const priorityOptions: { value: Priority; label: string; description: string }[] = [
  { value: 'lowest_monthly_total', label: 'Lowest monthly total', description: 'Minimize all costs combined' },
  { value: 'shortest_commute', label: 'Shortest commute', description: 'Save time getting to work' },
  { value: 'best_neighborhood_quality', label: 'Best neighborhood quality', description: 'Prioritize area livability' },
];

// --- Loading phase ---

function LoadingPhase({ message }: { message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-16 h-16">
        <motion.div className="absolute inset-0 rounded-full border-2 border-[#163D73]/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#163D73]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#163D73]/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <motion.p
        className="text-[#666666] text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

// --- Results phase ---

function ResultsPhase({ answers, onDone }: { answers: Answers; onDone: () => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const results = answers.apartments
    .filter(a => a.addressLine && a.rentEurosPerMonth !== '')
    .map((apt) => {
      const rent = typeof apt.rentEurosPerMonth === 'number' ? apt.rentEurosPerMonth : 0;
      const sqm = typeof apt.squareMeters === 'number' ? apt.squareMeters : 50;
      const utilities = Math.round(40 + sqm * 1.5);
      const parking = answers.transitMode === 'car' ? Math.round(50 + Math.random() * 60) : 0;
      const transport = answers.transitMode === 'tram_bus' ? 35 : answers.transitMode === 'zagreb_bike' ? 15 : 0;
      const commuteMin = Math.round(10 + Math.random() * 25);
      const total = rent + utilities + parking + transport;
      return {
        name: apt.addressLine,
        rent,
        utilities,
        parking,
        transport,
        commuteTime: `${commuteMin} min`,
        total,
        savings: 0,
      };
    });

  results.sort((a, b) => {
    if (answers.priority === 'shortest_commute') return parseInt(a.commuteTime) - parseInt(b.commuteTime);
    return a.total - b.total;
  });

  if (results.length > 0) {
    const best = results[0].total;
    results.forEach(r => { r.savings = r.total - best; });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#163D73]/10 text-[#163D73] rounded-full text-sm mb-4"
        >
          <Sparkles className="w-4 h-4" />
          {showBreakdown ? 'Cost breakdown' : 'Your personalized results'}
        </motion.div>
        <h3 className="text-[#0A0A0A] text-2xl" style={{ fontWeight: 600 }}>
          {showBreakdown ? 'Full cost breakdown' : 'Best apartments for you'}
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {showBreakdown ? (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-5 gap-2 text-[10px] uppercase tracking-wider text-[#9CA3AF] pb-2 border-b border-[#E5E7EB]">
              <div className="col-span-2">Apartment</div>
              <div className="text-right">Rent</div>
              <div className="text-right">Utilities</div>
              <div className="text-right">Other</div>
            </div>
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`grid grid-cols-5 gap-2 items-center py-3 border-b border-[#F3F4F6] ${i === 0 ? 'bg-[#163D73]/[0.02] -mx-2 px-2 rounded' : ''}`}
              >
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#163D73]" />}
                    <span className="text-[#0A0A0A] text-sm truncate" style={{ fontWeight: i === 0 ? 600 : 400 }}>{r.name}</span>
                  </div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">{r.commuteTime} commute</div>
                </div>
                <div className="text-right text-sm font-mono text-[#0A0A0A]">€{r.rent}</div>
                <div className="text-right text-sm font-mono text-[#666666]">€{r.utilities}</div>
                <div className="text-right text-sm font-mono text-[#666666]">€{r.parking + r.transport}</div>
              </motion.div>
            ))}
            <div className="grid grid-cols-5 gap-2 pt-3 border-t-2 border-[#E5E7EB]">
              <div className="col-span-2 text-[#0A0A0A] text-sm" style={{ fontWeight: 600 }}>Total / month</div>
              {results.map(r => (
                <div key={r.name} className="text-right text-sm font-mono text-[#0A0A0A]" style={{ fontWeight: 600 }}>
                  €{r.total}
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="pt-4 flex gap-3">
              <button
                onClick={() => setShowBreakdown(false)}
                className="flex-1 px-6 py-3.5 border border-[#D1D5DB] text-[#0A0A0A] rounded font-medium hover:border-[#9CA3AF] transition-colors"
              >
                Back to results
              </button>
              <button
                onClick={onDone}
                className="px-6 py-3.5 bg-[#163D73] text-white rounded font-medium hover:bg-[#1a4682] transition-colors"
              >
                Back to home
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className={`p-5 rounded border ${i === 0 ? 'border-[#163D73] bg-[#163D73]/[0.03]' : 'border-[#E5E7EB] bg-white'} relative overflow-hidden`}
                >
                  {i === 0 && (
                    <div className="absolute top-0 right-0 bg-[#163D73] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl">
                      Best match
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#9CA3AF] text-xs font-mono">#{i + 1}</span>
                        <span className="text-[#0A0A0A] truncate max-w-[200px]" style={{ fontWeight: 600 }}>{r.name}</span>
                      </div>
                      <div className="text-[#666666] text-sm">
                        {r.commuteTime} commute · €{r.rent} rent
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#0A0A0A] text-xl font-mono" style={{ fontWeight: 600 }}>
                        €{r.total}
                      </div>
                      <div className="text-[#666666] text-xs">per month</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="pt-4 flex gap-3">
              <button
                onClick={() => setShowBreakdown(true)}
                className="flex-1 px-6 py-3.5 bg-[#163D73] text-white rounded font-medium hover:bg-[#1a4682] transition-colors"
              >
                View full breakdown
              </button>
              <button
                onClick={onDone}
                className="px-6 py-3.5 border border-[#D1D5DB] text-[#666666] rounded font-medium hover:border-[#9CA3AF] transition-colors"
              >
                Back to home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Main quiz page ---

export function QuizFlow() {
  const navigate = useNavigate();
  const goHome = () => { navigate('/'); window.scrollTo(0, 0); };

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    apartments: [emptyApartment(), emptyApartment()],
    destination: { label: '', placeIdOrAddress: '' },
    transitMode: '',
    priority: '',
  });

  const loadingMessages = [
    'Analyzing apartments...',
    'Calculating commute costs...',
    'Comparing utility estimates...',
    'Finding your best match...',
  ];
  const [loadingMsg, setLoadingMsg] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsg(prev => (prev + 1) % loadingMessages.length);
      }, 1200);
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 4000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [isLoading]);

  const updateApartment = (index: number, field: keyof ApartmentCandidate, value: string) => {
    setAnswers(prev => {
      const updated = [...prev.apartments];
      if (field === 'rentEurosPerMonth' || field === 'squareMeters') {
        updated[index] = { ...updated[index], [field]: value === '' ? '' : Number(value) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, apartments: updated };
    });
  };

  const addApartment = () => {
    if (answers.apartments.length < 3) {
      setAnswers(prev => ({ ...prev, apartments: [...prev.apartments, emptyApartment()] }));
    }
  };

  const removeApartment = (index: number) => {
    if (answers.apartments.length > 2) {
      setAnswers(prev => ({
        ...prev,
        apartments: prev.apartments.filter((_, i) => i !== index),
      }));
    }
  };

  const canProceed = useCallback(() => {
    if (step === 0) {
      const validApts = answers.apartments.filter(
        a => a.addressLine.trim() !== '' && a.rentEurosPerMonth !== '' && a.squareMeters !== ''
      );
      return validApts.length >= 2 && answers.destination.label.trim() !== '' && answers.destination.placeIdOrAddress.trim() !== '';
    }
    if (step === 1) {
      return answers.transitMode !== '' && answers.priority !== '';
    }
    return false;
  }, [step, answers]);

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      setIsLoading(true);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const stepTitles = [
    'Enter your apartment candidates',
    'Transit mode & priority',
  ];
  const stepSubtitles = [
    'Add 2 to 3 apartments you\'re considering, plus your workplace',
    'How you\'ll commute and what matters most to you',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="max-w-[640px] mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <button
              onClick={goHome}
              className="flex items-center gap-1.5 md:gap-2 text-[#666666] hover:text-[#0A0A0A] transition-colors text-xs md:text-sm"
            >
              <ArrowUpLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <img src={logo} alt="Stanko Tražić" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
              <span className="text-[#0A0A0A] text-xs md:text-sm" style={{ fontWeight: 500 }}>Stanko Tražić</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8 md:py-16">
          {/* Progress bar */}
          {!isLoading && !showResults && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#9CA3AF] text-xs">Step {step + 1} of {TOTAL_STEPS}</span>
                <span className="text-[#9CA3AF] text-xs">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
              </div>
              <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#163D73] rounded-full"
                  animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingPhase key="loading" message={loadingMessages[loadingMsg]} />
            ) : showResults ? (
              <ResultsPhase key="results" answers={answers} onDone={goHome} />
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step header */}
                <div className="mb-8">
                  <h2 className="text-[#0A0A0A] text-2xl md:text-3xl mb-2" style={{ fontWeight: 600 }}>
                    {stepTitles[step]}
                  </h2>
                  <p className="text-[#9CA3AF] text-sm md:text-base">{stepSubtitles[step]}</p>
                </div>

                {/* Step 0: Apartment entry */}
                {step === 0 && (
                  <div className="space-y-6">
                    {answers.apartments.map((apt, i) => (
                      <div key={i} className="p-5 md:p-6 rounded border border-[#E5E7EB] bg-white space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[#0A0A0A] text-sm" style={{ fontWeight: 600 }}>
                            Apartment {i + 1}
                          </span>
                          {answers.apartments.length > 2 && (
                            <button
                              onClick={() => removeApartment(i)}
                              className="text-[#9CA3AF] hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[#666666] text-xs mb-1.5">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                            <input
                              type="text"
                              placeholder="e.g. Ilica 42, Zagreb"
                              value={apt.addressLine}
                              onChange={e => updateApartment(i, 'addressLine', e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded border border-[#E5E7EB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#163D73] transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#666666] text-xs mb-1.5">
                              Monthly rent <span className="text-[#9CA3AF]">EUR/month</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">€</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                placeholder="750"
                                value={apt.rentEurosPerMonth}
                                onChange={e => updateApartment(i, 'rentEurosPerMonth', e.target.value)}
                                className="w-full pl-8 pr-3 py-2.5 rounded border border-[#E5E7EB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#163D73] transition-colors font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#666666] text-xs mb-1.5">
                              Size <span className="text-[#9CA3AF]">m²</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                placeholder="55"
                                value={apt.squareMeters}
                                onChange={e => updateApartment(i, 'squareMeters', e.target.value)}
                                className="w-full pl-3 pr-9 py-2.5 rounded border border-[#E5E7EB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#163D73] transition-colors font-mono"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-xs">m²</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {answers.apartments.length < 3 && (
                      <button
                        onClick={addApartment}
                        className="w-full py-3.5 rounded border border-dashed border-[#D1D5DB] text-[#666666] text-sm flex items-center justify-center gap-2 hover:border-[#163D73] hover:text-[#163D73] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add a 3rd apartment
                      </button>
                    )}

                    <div className="pt-6 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded bg-[#163D73]/10 flex items-center justify-center">
                          <Navigation className="w-3.5 h-3.5 text-[#163D73]" />
                        </div>
                        <span className="text-[#0A0A0A] text-sm" style={{ fontWeight: 600 }}>Work / university destination</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#666666] text-xs mb-1.5">Name</label>
                          <input
                            type="text"
                            placeholder="e.g. FER Zagreb"
                            value={answers.destination.label}
                            onChange={e => setAnswers(prev => ({
                              ...prev,
                              destination: { ...prev.destination, label: e.target.value },
                            }))}
                            className="w-full px-3 py-2.5 rounded border border-[#E5E7EB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#163D73] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[#666666] text-xs mb-1.5">Address</label>
                          <input
                            type="text"
                            placeholder="e.g. Unska ul. 3"
                            value={answers.destination.placeIdOrAddress}
                            onChange={e => setAnswers(prev => ({
                              ...prev,
                              destination: { ...prev.destination, placeIdOrAddress: e.target.value },
                            }))}
                            className="w-full px-3 py-2.5 rounded border border-[#E5E7EB] bg-white text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#163D73] transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Transit & Priority */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[#0A0A0A] text-sm mb-3" style={{ fontWeight: 500 }}>
                        How do you commute?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {transitOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAnswers(prev => ({ ...prev, transitMode: opt.value }))}
                            className={`flex flex-col items-center gap-1.5 sm:gap-2 px-3 py-4 sm:py-5 rounded border text-center transition-all ${
                              answers.transitMode === opt.value
                                ? 'border-[#163D73] bg-[#163D73]/[0.05] text-[#0A0A0A]'
                                : 'border-[#E5E7EB] text-[#666666] hover:border-[#D1D5DB]'
                            }`}
                          >
                            <span className="text-xl sm:text-2xl">{opt.icon}</span>
                            <span className="text-[11px] sm:text-xs" style={{ fontWeight: 500 }}>{opt.label}</span>
                            {answers.transitMode === opt.value && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#163D73]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#0A0A0A] text-sm mb-3" style={{ fontWeight: 500 }}>
                        What's your priority?
                      </label>
                      <div className="space-y-2">
                        {priorityOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAnswers(prev => ({ ...prev, priority: opt.value }))}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded border text-left transition-all ${
                              answers.priority === opt.value
                                ? 'border-[#163D73] bg-[#163D73]/[0.05]'
                                : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              answers.priority === opt.value
                                ? 'border-[#163D73]'
                                : 'border-[#D1D5DB]'
                            }`}>
                              {answers.priority === opt.value && (
                                <div className="w-2 h-2 rounded-full bg-[#163D73]" />
                              )}
                            </div>
                            <div>
                              <div className="text-[#0A0A0A] text-sm" style={{ fontWeight: 500 }}>{opt.label}</div>
                              <div className="text-[#9CA3AF] text-xs mt-0.5">{opt.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E5E7EB]">
                  <button
                    onClick={step === 0 ? goHome : prev}
                    className="flex items-center gap-2 px-4 py-2.5 rounded text-sm text-[#666666] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {step === 0 ? 'Cancel' : 'Back'}
                  </button>
                  <button
                    onClick={next}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-medium transition-all ${
                      canProceed()
                        ? 'bg-[#163D73] text-white hover:bg-[#1a4682]'
                        : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    }`}
                  >
                    {step === TOTAL_STEPS - 1 ? 'See results' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}