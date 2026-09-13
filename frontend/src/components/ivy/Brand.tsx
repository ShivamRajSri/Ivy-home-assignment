import { Leaf } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex min-w-0 items-center gap-3"><span className="relative grid size-10 shrink-0 place-items-center rounded-md bg-primary text-lg font-semibold text-primary-foreground">I<Leaf className="absolute right-1 top-1 size-3" /></span>{!compact && <span className="font-display text-xl font-semibold text-foreground">Ivy Homes</span>}</div>;
}
