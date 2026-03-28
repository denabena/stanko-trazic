export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] py-8 md:py-12">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-sm text-[#9CA3AF]">Stanko Tražić</div>

          <div className="flex gap-8">
            <a
              href="#privacy"
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#666666]"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#666666]"
            >
              Terms
            </a>
          </div>

          <div className="text-sm text-[#9CA3AF]">Built for Zagreb renters.</div>
        </div>
      </div>
    </footer>
  );
}
