import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getProfile } from "@/lib/data";
import { isKrogerConfigured } from "@/lib/kroger/client";
import type { KrogerConnectStatus } from "@/lib/kroger/oauth";
import { isKrogerConnected } from "@/lib/kroger/session";
import { cn } from "@/lib/utils";
import { disconnectKroger } from "./actions";
import { DisconnectButton } from "./disconnect-button";
import { StorePicker } from "./store-picker";

export const metadata: Metadata = {
  title: "Kroger",
};

const card =
  "rounded-3xl border bg-card p-5 shadow-[0_1px_2px_rgba(28,41,32,0.04),0_8px_24px_-12px_rgba(28,41,32,0.08)] sm:p-6";

// What to say after coming back from kroger.com (`?kroger=` on the URL).
const NOTICES: Record<KrogerConnectStatus, { text: string; tone: "sage" | "neutral" | "tomato" }> =
  {
    connected: { text: "Kroger is connected.", tone: "sage" },
    denied: { text: "Kroger wasn't connected. You can try again anytime.", tone: "neutral" },
    error: { text: "We couldn't connect to Kroger. Please try again.", tone: "tomato" },
    unavailable: { text: "Kroger isn't set up on this site yet.", tone: "tomato" },
  };

const NOTICE_TONES = {
  sage: "bg-sage-soft text-sage-ink",
  neutral: "bg-muted text-muted-foreground",
  tomato: "bg-tomato-soft text-tomato-ink",
};

export default async function KrogerSettingsPage({ searchParams }: PageProps<"/settings/kroger">) {
  const [{ krogerStore }, connected, { kroger }] = await Promise.all([
    getProfile(),
    isKrogerConnected(),
    searchParams,
  ]);
  const notice = typeof kroger === "string" ? NOTICES[kroger as KrogerConnectStatus] : undefined;

  return (
    <div className="space-y-10">
      {notice && (
        <p
          role={notice.tone === "tomato" ? "alert" : "status"}
          className={cn("rounded-2xl px-4 py-3 text-sm", NOTICE_TONES[notice.tone])}
        >
          {notice.text}
        </p>
      )}

      <section aria-labelledby="store-heading">
        <h2 id="store-heading" className="text-base font-semibold">
          Your store
        </h2>
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
          Groceries are matched to products and prices at this store.
        </p>
        <StorePicker current={krogerStore} />
      </section>

      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-base font-semibold">
          Kroger account
        </h2>
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
          Connect it to send your grocery list to your Kroger cart. You always review and check out
          on kroger.com.
        </p>
        <div className={cn(card, "flex flex-wrap items-center justify-between gap-4")}>
          <div className="space-y-1.5">
            {connected ? (
              <Badge tone="sage">
                <Check />
                Connected
              </Badge>
            ) : (
              <Badge>Not connected</Badge>
            )}
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Plantry can add groceries to your Kroger cart from this browser."
                : "You'll sign in on kroger.com. Plantry never sees your Kroger password."}
            </p>
          </div>
          {connected ? (
            <form action={disconnectKroger}>
              <DisconnectButton />
            </form>
          ) : (
            isKrogerConfigured() && (
              // A plain link: this leaves the app for kroger.com.
              <a href="/api/kroger/connect" className={buttonVariants({ size: "sm" })}>
                Connect Kroger
              </a>
            )
          )}
        </div>
      </section>
    </div>
  );
}
