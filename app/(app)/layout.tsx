import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { APP_HOME } from "@/lib/auth";
import { getProfile } from "@/lib/data";

// Shell for every signed-in page. Add new app pages inside app/(app)/.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { displayName, email, onboarded } = await getProfile();
  // New accounts go through first-time setup before they see the app.
  if (!onboarded) redirect("/onboarding");
  const name = displayName || email;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Logo href={APP_HOME} />

          <div className="ml-auto">
            <AccountMenu name={name} email={email} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
