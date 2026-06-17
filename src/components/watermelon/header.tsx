import { BrandLogo } from "./brand-logo";
import { AiBadge } from "./ai-badge";

interface HeaderProps {
  aiUsed: boolean;
}

export function Header({ aiUsed }: HeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between">
      <BrandLogo />
      <AiBadge aiUsed={aiUsed} />
    </header>
  );
}
