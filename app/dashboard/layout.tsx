import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHousehold } from "@/lib/data";

const UPCOMING_SECTIONS = ["Meal plan", "Kitchen", "Groceries"];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { profile, email } = await getHousehold();
  const name = profile.display_name || email;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Logo href="/dashboard" />
          <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
            <span aria-current="page" className="rounded-full bg-secondary px-4 py-2 font-medium">
              Overview
            </span>
            {UPCOMING_SECTIONS.map((label) => (
              <span
                key={label}
                aria-disabled
                title="Coming soon"
                className="flex cursor-default items-center gap-2 rounded-full px-4 py-2 text-muted-foreground/80"
              >
                {label}
              </span>
            ))}
            <Badge tone="saffron" className="ml-1">
              Soon
            </Badge>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-saffron-soft text-sm font-semibold text-saffron-ink uppercase">
                {name.charAt(0)}
              </span>
              <span className="max-w-40 truncate text-sm font-medium">{name}</span>
            </span>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
                <LogOut />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
