import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">Settings</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Change these anytime. Your next plan will follow them.
      </p>

      <SettingsTabs />

      <div className="mt-10">{children}</div>
    </div>
  );
}
