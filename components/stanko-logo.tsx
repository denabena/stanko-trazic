export function StankoLogo({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-[#163D73] text-xs font-bold text-white ${className ?? "size-7 md:size-8"}`}
      aria-hidden
    >
      ST
    </div>
  );
}
