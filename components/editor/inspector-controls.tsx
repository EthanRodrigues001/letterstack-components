"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerSelection,
} from "@/components/ui/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RangeSlider } from "@/components/motion/range-slider";
import { cn } from "@/lib/utils";

export type ToggleOption = {
  value: string;
  label: string;
  icon?: React.ComponentProps<typeof HugeiconsIcon>["icon"];
};

/**
 * Compact segmented control: a recessed track with the selected option raised
 * out of it, matching the viewport toggle in the editor header. Rendered as
 * plain buttons rather than shadcn ToggleGroup, whose baked-in rounded-3xl /
 * rounded-4xl rules fight the square look this panel wants.
 *
 * Icon-only whenever an option supplies an icon; the label still rides along
 * as the title and aria-label so hover and screen readers keep the words.
 */
export function OptionToggle({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      data-slot="option-toggle"
      aria-label={ariaLabel}
      className={cn(
        // max-w-fit, not just w-fit: shadcn Field is vertical by default,
        // which sets *:w-full on every direct child and would otherwise
        // stretch this track across the panel. A max-width still wins against
        // that width:100% without needing !important.
        "inline-flex h-7 w-fit max-w-fit self-start items-center rounded-md bg-muted p-0.5",
        className
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <React.Fragment key={option.value}>
            {index > 0 && (
              <span
                aria-hidden
                className="mx-px h-3.5 w-px shrink-0 bg-border/70"
              />
            )}
            <button
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              aria-label={option.label}
              title={option.label}
              className={cn(
                // Sized to its contents, not stretched: a square cell for an
                // icon, just enough padding for a word.
                "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[5px] px-1.5 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selected
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.icon ? (
                <HugeiconsIcon
                  icon={option.icon}
                  strokeWidth={2}
                  data-icon="icon"
                  className="size-3.5"
                />
              ) : (
                option.label
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Stacked label + value readout above the motion RangeSlider. Shared by the
 * block inspector and the theme panel so every slider looks the same.
 */
export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  description,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  description?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <RangeSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        aria-label={label}
        className="h-7 rounded-md"
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}

/**
 * One flat, always-visible group in the inspector: a small title row with
 * optional icon-only actions on the right, a rule beneath it, and the fields
 * below. Replaces the accordion the inspector used to be, so every control is
 * visible at once instead of one section at a time.
 */
export function InspectorSection({
  title,
  actions,
  className,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-b border-border/60 px-3 py-2.5 last:border-b-0",
        // Density scope. The shadcn field primitives are sized for forms
        // (FieldGroup alone is gap-7), which is far too airy for an inspector
        // panel, so the section tightens every slot it contains in one place
        // instead of every call site overriding them by hand.
        // Two columns. A field holding nothing but a segmented control is
        // narrow enough to pair up, so it takes one column; anything else — a
        // slider, a colour row, a text input — spans both. Driven off the
        // markup rather than every call site opting in by hand.
        "[&_[data-slot=field-group]]:grid [&_[data-slot=field-group]]:grid-cols-2 [&_[data-slot=field-group]]:items-start [&_[data-slot=field-group]]:gap-x-2 [&_[data-slot=field-group]]:gap-y-2.5",
        "[&_[data-slot=field]]:col-span-2 [&_[data-slot=field]:has(>[data-slot=option-toggle])]:col-span-1",
        "[&_[data-slot=field]]:gap-1",
        "[&_[data-slot=field-label]]:text-[11px] [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:text-muted-foreground",
        "[&_[data-slot=field-description]]:text-[11px] [&_[data-slot=field-description]]:leading-snug",
        "[&_[data-slot=input]]:h-7 [&_[data-slot=input]]:text-xs",
        className
      )}
    >
      <div className="mb-2 flex h-5 items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {actions && (
          <div className="flex items-center gap-0.5 text-muted-foreground">
            {actions}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Turns the picker's [r, g, b, a] back into the hex string the document stores.
 *
 * Alpha only appears when it is actually below 1, so fully opaque colours stay
 * as plain 6-digit hex and nothing downstream sees a format it did not before.
 * A translucent colour becomes 8-digit #RRGGBBAA, which the compiler writes
 * into inline CSS as-is.
 */
function rgbaToHex(r: number, g: number, b: number, a: number) {
  const channels = [r, g, b];
  if (a < 1) channels.push(a * 255);
  return (
    "#" +
    channels
      .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * A colour as one control rather than a swatch sitting next to a text box:
 * swatch, hex, then an optional opacity cell behind a divider.
 *
 * The swatch opens the full picker — area, hue, eyedropper, format readout —
 * in a popover rather than handing off to the OS colour dialog, and that
 * popover is also where "transparent" lives, since an unset colour is a real
 * state here rather than an empty text field. The hex cell always shows a hex,
 * falling back to the colour this would inherit, so the row never reads blank.
 */
export function ColorField({
  value,
  onChange,
  fallback = "#ffffff",
  trailing,
  opacity,
  onOpacityChange,
  allowTransparent = true,
  className,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  /** Shown when nothing is set — the colour this would inherit. */
  fallback?: string;
  trailing?: React.ReactNode;
  /** Percent 0-100. Renders the opacity cell only when both are given. */
  opacity?: number;
  onOpacityChange?: (value: number) => void;
  /** Offer "Transparent" in the picker. Off for colours that must be set. */
  allowTransparent?: boolean;
  className?: string;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const isTransparent = !value;

  // Opacity is read straight out of the stored colour: an 8-digit #RRGGBBAA
  // carries it, anything shorter is fully opaque. That means every colour row
  // shows the percentage without the document needing a parallel field. A
  // caller with its own opacity number (the shadow) overrides both halves.
  const alphaFromValue = React.useMemo(() => {
    if (!value) return 0;
    const match = /^#?[0-9a-f]{6}([0-9a-f]{2})$/i.exec(value);
    if (!match) return 100;
    return Math.round((parseInt(match[1], 16) / 255) * 100);
  }, [value]);

  const shownOpacity = opacity ?? alphaFromValue;
  const applyOpacity =
    onOpacityChange ??
    ((next: number) => {
      const base = (value || fallback).slice(0, 7);
      if (next >= 100) return onChange(base);
      const suffix = Math.round((next / 100) * 255)
        .toString(16)
        .padStart(2, "0");
      onChange(base + suffix);
    });

  return (
    <div
      className={cn(
        // Hugs its contents like the segmented control. max-w-fit is what
        // actually wins here: shadcn Field sets *:w-full on its children.
        "inline-flex h-7 w-fit max-w-fit self-start items-center gap-1.5 rounded-md border border-input bg-transparent pl-1 dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
    >
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Edit colour"
          className="flex size-5 shrink-0 items-center justify-center rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            className="size-4 rounded-[3px] border border-border/60"
            style={
              isTransparent
                ? {
                    // Diagonal strike: the conventional "no colour" swatch.
                    backgroundImage:
                      "linear-gradient(to top right, transparent calc(50% - 1px), var(--destructive) calc(50% - 1px), var(--destructive) calc(50% + 1px), transparent calc(50% + 1px))",
                  }
                : { backgroundColor: value }
            }
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60 p-3">
          <ColorPicker
            // ColorPicker seeds its sliders once, on mount. Keying it to the
            // colour we opened with means each open starts from what is
            // actually stored, rather than from whatever the last session of
            // the picker left behind.
            key={value ?? "transparent"}
            // Transparent opens at zero alpha rather than at a fully opaque
            // fallback, so the alpha slider reflects what the swatch shows.
            // Dragging it up is then the natural way back to a real colour.
            defaultValue={value || fallback.slice(0, 7) + "00"}
            onChange={([r, g, b, a]) => {
              // Dragging alpha to zero is the same statement as "Transparent",
              // so it clears rather than storing an invisible colour — but only
              // where unset is a legal state.
              if (a === 0 && allowTransparent) return onChange(undefined);
              onChange(rgbaToHex(r, g, b, a));
            }}
            className="h-auto w-full gap-3"
          >
            <ColorPickerSelection className="h-32 rounded-md" />
            <ColorPickerHue />
            <ColorPickerAlpha />
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper className="size-8" />
              <ColorPickerFormat />
            </div>
          </ColorPicker>
          {allowTransparent && (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                // Close as well: leaving the picker open on the colour that was
                // just cleared reads as "nothing happened".
                setPickerOpen(false);
              }}
              className={cn(
                "mt-3 flex h-7 w-full items-center justify-center rounded-md border text-[11px] font-medium transition-colors",
                isTransparent
                  ? "border-ring bg-accent text-foreground"
                  : "border-input text-muted-foreground hover:text-foreground"
              )}
            >
              Transparent
            </button>
          )}
        </PopoverContent>
      </Popover>
      <input
        value={(value || fallback).toUpperCase()}
        onChange={(event) => onChange(event.target.value || undefined)}
        spellCheck={false}
        aria-label="Hex colour"
        className={cn(
          "w-[9ch] shrink-0 bg-transparent font-mono text-[11px] uppercase outline-none",
          isTransparent ? "text-muted-foreground" : "text-foreground"
        )}
      />
      <span aria-hidden className="h-full w-px shrink-0 bg-border/70" />
      <span className="flex shrink-0 items-center pr-1.5 text-[11px] text-muted-foreground">
        <input
          type="number"
          min={0}
          max={100}
          value={shownOpacity}
          aria-label="Opacity"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            applyOpacity(Math.min(100, Math.max(0, next)));
          }}
          className="w-[4ch] bg-transparent text-right tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="pl-1">%</span>
      </span>
      {trailing && (
        <>
          <span aria-hidden className="h-full w-px shrink-0 bg-border/70" />
          <span className="flex shrink-0 items-center gap-1 pr-1.5 text-[11px] text-muted-foreground">
            {trailing}
          </span>
        </>
      )}
    </div>
  );
}
