"use client";

import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { normalizeFood } from "@/lib/preferences";
import { cn, sentenceCase } from "@/lib/utils";

const tagTones = {
  tomato: "bg-tomato-soft text-tomato-ink",
  saffron: "bg-saffron-soft text-saffron-ink",
  sage: "bg-sage-soft text-sage-ink",
};

/** A list of foods shown as removable pills. Enter or comma adds one. */
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
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-input bg-card p-2 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
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
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            // Commit when focus moves elsewhere on the page, but not when the
            // whole window loses focus mid-word (e.g. switching apps).
            if (document.hasFocus()) add(event.currentTarget.value);
          }}
          placeholder={values.length > 0 ? "Add another…" : placeholder}
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
