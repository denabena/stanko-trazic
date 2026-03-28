import { useNavigate } from 'react-router';
import { Navigation } from './navigation';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { ResultsPreview } from './results-preview';
import { FeatureCallouts } from './feature-callouts';
import { SocialProofBar } from './social-proof-bar';
import { FinalCTA } from './final-cta';
import { Footer } from './footer';
import { AboutSection } from './about-section';
import { AnimatedBackground } from './animated-background';

export function MarketingPage() {
  const navigate = useNavigate();
  const startQuiz = () => navigate('/quiz');

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
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
