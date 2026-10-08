import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl font-medium sm:text-5xl">Settings</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Change these anytime. Your next plan will follow them.
        </p>
      </div>

      {/* Tabs sit above the content on small screens and beside it from lg up. */}
      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <SettingsTabs />
        <div className="max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
