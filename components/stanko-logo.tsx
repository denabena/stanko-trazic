import Image from "next/image";

export function StankoLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/stanko-logo.png"
      alt="Stanko Tražić"
      width={512}
      height={512}
      className={`shrink-0 object-contain ${className ?? "size-7 md:size-8"}`}
      priority
    />
  );
}
