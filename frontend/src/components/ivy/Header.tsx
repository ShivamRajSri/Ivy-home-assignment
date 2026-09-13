import { LogOut, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";
export function Header({ name, onLogout }: { name: string; onLogout: () => void }) {
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur"><div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:px-10"><div className="flex min-w-0 items-center gap-6"><Brand /><span className="hidden h-5 w-px bg-border sm:block"/><span className="hidden text-sm font-medium sm:block">Properties</span></div><div className="flex shrink-0 items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium sm:flex"><MapPin className="size-3.5 text-primary"/>Chennai <span className="text-muted-foreground">City 4</span></div><Avatar className="size-9 border border-border"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut/></Button></div></div></header>;
}
