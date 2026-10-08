// Remounts when the tab changes, so each tab's content gets its own entrance.
export default function SettingsTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
