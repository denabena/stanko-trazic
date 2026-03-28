import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import logo from 'figma:asset/917aa83a6589d3e628579bf9fe58ef8b347648ef.png';

export function Navigation({ onStartQuiz }: { onStartQuiz: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      const handler = () => setMobileMenuOpen(false);
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-white/90 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="flex items-center justify-between h-14 md:h-20">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Stanko Tražić" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
            <span className="text-[#0A0A0A] text-[15px] md:text-[17px]" style={{ fontWeight: 700 }}>
              Stanko Tražić
              <span className="block text-[#9CA3AF] text-[9px] md:text-[10px] tracking-wide" style={{ fontWeight: 400 }}>
                /stahn-koh trah-zhich/
              </span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-[#666666] hover:text-[#0A0A0A] transition-colors text-sm"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text-[#666666] hover:text-[#0A0A0A] transition-colors text-sm"
            >
              About
            </a>
            <button
              onClick={onStartQuiz}
              className="px-6 py-2.5 bg-[#163D73] text-white rounded font-medium text-sm hover:bg-[#1a4682] transition-colors"
            >
              Start comparing
            </button>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onStartQuiz}
              className="px-4 py-2 bg-[#163D73] text-white rounded font-medium text-xs"
            >
              Start
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0A0A0A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[#E5E7EB]"
          >
            <div className="px-5 py-4 space-y-1 bg-white">
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="block w-full text-left px-3 py-3 text-[#666666] hover:text-[#0A0A0A] hover:bg-[#FAFAFA] rounded transition-colors text-sm"
              >
                How it works
              </button>
              <button
                onClick={() => handleNavClick('results')}
                className="block w-full text-left px-3 py-3 text-[#666666] hover:text-[#0A0A0A] hover:bg-[#FAFAFA] rounded transition-colors text-sm"
              >
                Results preview
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="block w-full text-left px-3 py-3 text-[#666666] hover:text-[#0A0A0A] hover:bg-[#FAFAFA] rounded transition-colors text-sm"
              >
                About
              </button>
              <div className="pt-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onStartQuiz(); }}
                  className="w-full px-4 py-3 bg-[#163D73] text-white rounded font-medium text-sm"
                >
                  Start comparing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="h-[1px] bg-[#E5E7EB]" />
      </div>
    </motion.nav>
  );
}
