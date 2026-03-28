"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

import { StankoLogo } from "@/components/stanko-logo";

export function Navigation({ onStartQuiz }: { onStartQuiz: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const handler = () => setMobileMenuOpen(false);
      window.addEventListener("scroll", handler);
      return () => window.removeEventListener("scroll", handler);
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "bg-white/90 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="flex h-14 items-center justify-between md:h-20">
          <div className="flex items-center gap-2.5">
            <StankoLogo />
            <span
              className="text-[15px] text-[#0A0A0A] md:text-[17px]"
              style={{ fontWeight: 700 }}
            >
              Stanko Tražić
              <span
                className="-mt-0.5 block text-[9px] tracking-wide text-[#9CA3AF] md:text-[10px]"
                style={{ fontWeight: 400 }}
              >
                /stahn-koh trah-zhich/
              </span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => handleNavClick("how-it-works")}
              className="cursor-pointer text-sm text-[#666666] transition-colors hover:text-[#0A0A0A]"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("about")}
              className="cursor-pointer text-sm text-[#666666] transition-colors hover:text-[#0A0A0A]"
            >
              About
            </button>
            <button
              type="button"
              onClick={onStartQuiz}
              className="cursor-pointer rounded bg-[#163D73] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a4682]"
            >
              Start comparing
            </button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={onStartQuiz}
              className="cursor-pointer rounded bg-[#163D73] px-4 py-2 text-xs font-medium text-white"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer p-2 text-[#0A0A0A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#E5E7EB] md:hidden"
          >
            <div className="space-y-1 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => handleNavClick("how-it-works")}
                className="block w-full cursor-pointer rounded px-3 py-3 text-left text-sm text-[#666666] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A]"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("results")}
                className="block w-full cursor-pointer rounded px-3 py-3 text-left text-sm text-[#666666] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A]"
              >
                Results preview
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("about")}
                className="block w-full cursor-pointer rounded px-3 py-3 text-left text-sm text-[#666666] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A]"
              >
                About
              </button>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onStartQuiz();
                  }}
                  className="w-full cursor-pointer rounded bg-[#163D73] px-4 py-3 text-sm font-medium text-white"
                >
                  Start comparing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="h-px bg-[#E5E7EB]" />
      </div>
    </nav>
  );
}
