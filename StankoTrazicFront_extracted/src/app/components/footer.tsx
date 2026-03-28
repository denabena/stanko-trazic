export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Wordmark */}
          <div className="text-[#9CA3AF] text-sm">
            Stanko Tražić
          </div>

          {/* Center: Links */}
          <div className="flex gap-8">
            <a 
              href="#privacy" 
              className="text-[#9CA3AF] hover:text-[#666666] transition-colors text-sm"
            >
              Privacy
            </a>
            <a 
              href="#terms" 
              className="text-[#9CA3AF] hover:text-[#666666] transition-colors text-sm"
            >
              Terms
            </a>
          </div>

          {/* Right: Tagline */}
          <div className="text-[#9CA3AF] text-sm">
            Built for Zagreb renters.
          </div>
        </div>
      </div>
    </footer>
  );
}