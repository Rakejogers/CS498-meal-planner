"use client";

import { PencilLine, Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { normalizeFood } from "@/lib/preferences";
import { cn, sentenceCase } from "@/lib/utils";

const tagTones = {
  tomato: "bg-tomato-soft text-tomato-ink",
  saffron: "bg-saffron-soft text-saffron-ink",
  sage: "bg-sage-soft text-sage-ink",
};

// Phones show this many suggestions so the list doesn't push past the screen.
const PHONE_SUGGESTIONS = 12;

/**
 * A list of foods shown as removable pills. Type any food (Enter, comma, or
 * the Add button adds it) or tap a suggestion below.
 */
export function TagInput({
  id,
  name,
  values,
  onAdd,
  onRemove,
  suggestions,
  placeholder,
  tone,
}: {
  id: string;
  /** Each value is submitted with the form under this name. */
  name: string;
  values: string[];
  onAdd: (food: string) => void;
  onRemove: (food: string) => void;
  suggestions: string[];
  placeholder: string;
  tone: keyof typeof tagTones;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const food = normalizeFood(raw);
    setDraft("");
    if (food) onAdd(food);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === ",") {
      // Enter adds the food instead of submitting the whole form.
      event.preventDefault();
      add(event.currentTarget.value);
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onRemove(values[values.length - 1]);
    }
  };

  const remaining = suggestions.filter((suggestion) => !values.includes(suggestion));

  return (
    <div>
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-input bg-card p-2 pl-3.5 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
        <PencilLine aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        {values.map((value) => (
          <span
            key={value}
            className={cn(
              "inline-flex animate-pop-in items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm font-medium",
              tagTones[tone],
            )}
          >
            <input type="hidden" name={name} value={value} />
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
        <div className="flex min-w-48 flex-1 items-center gap-2">
          <input
            id={id}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={(event) => {
              // Commit when focus moves elsewhere on the page (except to the
              // Add button, which commits itself), but not when the whole
              // window loses focus mid-word (e.g. switching apps).
              if (event.relatedTarget?.closest("[data-add-food]")) return;
              if (document.hasFocus()) add(event.currentTarget.value);
            }}
            placeholder={values.length > 0 ? "Type another food…" : placeholder}
            className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          {draft.trim() && (
            <button
              type="button"
              data-add-food
              onClick={() => add(draft)}
              className="inline-flex h-9 shrink-0 animate-pop-in cursor-pointer items-center gap-1 rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Add
            </button>
          )}
        </div>
      </div>
      {remaining.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Or tap to add
          </span>
          {remaining.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-input bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:border-solid hover:border-foreground/20 hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20",
                index >= PHONE_SUGGESTIONS && "max-sm:hidden",
              )}
            >
              <Plus className="size-3.5" />
              {sentenceCase(suggestion)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
