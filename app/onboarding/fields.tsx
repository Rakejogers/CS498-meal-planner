"use client";

import { Check, Minus, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn, sentenceCase } from "@/lib/utils";

export function Field({
  label,
  hint,
  aside,
  children,
}: {
  label: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{label}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Chip({
  selected,
  onToggle,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.97]",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "bg-card hover:border-foreground/20 hover:bg-secondary/60",
      )}
    >
      {selected && <Check className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex w-full cursor-pointer flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-[0.99]",
        selected
          ? "border-primary shadow-sm ring-4 ring-primary/10"
          : "hover:border-foreground/20",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-4 right-4 grid size-5 place-items-center rounded-full border transition-colors",
          selected && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      {icon}
      <span className="pr-6">
        <span className="block font-medium">{title}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border bg-card p-1.5 shadow-xs">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
      >
        <Minus />
      </Button>
      <output
        aria-live="polite"
        className="w-14 text-center font-display text-3xl font-medium tabular-nums"
      >
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`More ${label}`}
      >
        <Plus />
      </Button>
    </div>
  );
}

const tagTones = {
  tomato: "bg-tomato-soft text-tomato-ink",
  saffron: "bg-saffron-soft text-saffron-ink",
};

export function TagInput({
  values,
  onAdd,
  onRemove,
  suggestions,
  placeholder,
  tone,
  label,
}: {
  values: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  suggestions: string[];
  placeholder: string;
  tone: keyof typeof tagTones;
  label: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const name = raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 80);
    setDraft("");
    if (name) onAdd(name);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(event.currentTarget.value);
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onRemove(values[values.length - 1]);
    }
  };

  const remaining = suggestions.filter((suggestion) => !values.includes(suggestion));

  return (
    <div>
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-input bg-card p-2 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
        {values.map((value) => (
          <span
            key={value}
            className={cn(
              "inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm font-medium",
              tagTones[tone],
            )}
          >
            {sentenceCase(value)}
            <button
              type="button"
              onClick={() => onRemove(value)}
              className="grid size-5 cursor-pointer place-items-center rounded-full transition-colors hover:bg-black/10"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            // Commit when focus moves elsewhere on the page, but not when the
            // whole window loses focus mid-word (e.g. switching apps).
            if (document.hasFocus()) add(event.currentTarget.value);
          }}
          placeholder={values.length > 0 ? "Add another…" : placeholder}
          aria-label={label}
          className="h-9 min-w-40 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Quick add</span>
          {remaining.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-solid hover:border-foreground/20 hover:text-foreground"
            >
              <Plus className="size-3" />
              {sentenceCase(suggestion)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
