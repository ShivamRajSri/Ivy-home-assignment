import { LogOut, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";

export function Header({
  name,
  onLogout,
}: {
  name: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { label: "Properties", path: "/" },
    { label: "Rentals", path: "/rentals" },
    { label: "Projects", path: "/projects" },
    { label: "Insights", path: "/insights" },
    { label: "Saved", path: "/saved" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand + Navigation */}
        <div className="flex min-w-0 items-center gap-4">
          <Brand />

          <span className="hidden h-5 w-px bg-border sm:block" />

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="text-sm"
                  onClick={() => navigate({ to: item.path })}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium sm:flex">
            <MapPin className="size-3.5 text-primary" />
            Chennai
            <span className="text-muted-foreground">City 4</span>
          </div>

          <Avatar className="size-9 border border-border">
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut />
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border/50 px-4 py-2 md:hidden sm:px-6">
        {navigation.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => navigate({ to: item.path })}
            >
              {item.label}
            </Button>
          );
        })}
      </nav>
    </header>
  );
}