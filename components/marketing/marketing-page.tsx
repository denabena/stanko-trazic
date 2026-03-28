"use client";

import { useRouter } from "next/navigation";

import { AnimatedBackground } from "@/components/animated-background";

import { AboutSection } from "./about-section";
import { FeatureCallouts } from "./feature-callouts";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Navigation } from "./navigation";
import { ResultsPreview } from "./results-preview";
import { SocialProofBar } from "./social-proof-bar";

export function MarketingPage() {
  const router = useRouter();
  const startQuiz = () => router.push("/quiz");

  return (
    <div className="relative min-h-screen bg-white">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navigation onStartQuiz={startQuiz} />
        <Hero onStartQuiz={startQuiz} />
        <HowItWorks />
        <ResultsPreview />
        <FeatureCallouts />
        <SocialProofBar />
        <AboutSection />
        <FinalCTA onStartQuiz={startQuiz} />
        <Footer />
      </div>
    </div>
  );
}
