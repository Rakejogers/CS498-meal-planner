import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { APP_HOME } from "@/lib/auth";
import { getProfile } from "@/lib/data";

// Shell for every signed-in page. Add new app pages inside app/(app)/.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { displayName, email } = await getProfile();
  const name = displayName || email;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Logo href={APP_HOME} />

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
