"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RangeSlider } from "@/components/motion/range-slider";
import {
  touchDocument,
  type EmailDocument,
  type EmailDocumentSettings,
} from "@/lib/email/document";
import themePresets from "@/lib/email/theme-presets.json";
import { FONT_FAMILIES } from "./editor-types";
import { ColorField, InspectorSection, OptionToggle } from "./inspector-controls";

type ThemePreset = {
  id: string;
  name: string;
  description: string;
  settings: Pick<
    EmailDocumentSettings,
    | "backgroundColor"
    | "contentColor"
    | "accentColor"
    | "linkColor"
    | "textColor"
    | "fontFamily"
    | "maxWidth"
    | "padding"
    | "radius"
    | "shadowEnabled"
    | "shadowColor"
    | "shadowOpacity"
    | "shadowBlur"
    | "shadowSpread"
    | "shadowOffsetX"
    | "shadowOffsetY"
    | "buttonBackgroundColor"
    | "buttonTextColor"
    | "secondaryButtonBackgroundColor"
    | "secondaryButtonTextColor"
    | "buttonRadius"
    | "buttonPaddingY"
    | "buttonPaddingX"
    | "buttonFontSize"
  >;
};

const EMAIL_THEME_PRESETS = themePresets as ThemePreset[];

export function StylesPanel({
  document,
  onUpdateDocument,
}: {
  document: EmailDocument;
  onUpdateDocument: (updater: (current: EmailDocument) => EmailDocument) => void;
}) {
  const set = <K extends keyof EmailDocumentSettings>(
    key: K,
    value: EmailDocumentSettings[K],
  ) => {
    onUpdateDocument((c) =>
      touchDocument({ ...c, settings: { ...c.settings, [key]: value } }),
    );
  };
  const s = document.settings;
  const activePreset = EMAIL_THEME_PRESETS.find((preset) =>
    Object.entries(preset.settings).every(
      ([key, value]) => s[key as keyof EmailDocumentSettings] === value,
    ),
  );

  const applyPreset = (presetId: string) => {
    const preset = EMAIL_THEME_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    onUpdateDocument((current) =>
      touchDocument({
        ...current,
        settings: { ...current.settings, ...preset.settings },
      }),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-secondary">
      {/* Header — matches the block inspector's bar so the two panels read
          as the same surface. */}
      <div className="flex h-8 shrink-0 items-center bg-secondary px-3">
        <p className="text-xs font-medium text-muted-foreground">Email styles</p>
      </div>

      {/* The body is a card lifted onto the secondary bar above it, so the
          header reads as the surface the panel sits on. */}
      <div className="min-h-0 flex-1 overflow-auto rounded-t-xl bg-card [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <InspectorSection title="Themes">
            <div className="flex flex-col gap-3">
              <Field>
                <FieldLabel>Preset theme</FieldLabel>
                <Select
                  value={activePreset?.id ?? ""}
                  onValueChange={applyPreset}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    {/* SelectValue already renders the chosen option (swatches +
                        name); a manual swatch here duplicated the color scheme. */}
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-[var(--radix-select-trigger-width)]"
                  >
                    {EMAIL_THEME_PRESETS.map((preset) => (
                      <SelectItem
                        key={preset.id}
                        value={preset.id}
                        textValue={preset.name}
                        className="text-xs"
                      >
                        <ThemePresetOption preset={preset} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
        </InspectorSection>

        <InspectorSection title="Background">
            <div className="flex flex-col gap-3">
              <StyleColorRow
                label="Outer background"
                value={s.backgroundColor}
                onChange={(v) => set("backgroundColor", v)}
              />
              <StyleColorRow
                label="Email background"
                value={s.contentColor}
                onChange={(v) => set("contentColor", v)}
              />
            </div>
        </InspectorSection>

        <InspectorSection title="Text">
            <div className="flex flex-col gap-3">
              <Field>
                <FieldLabel>Font family</FieldLabel>
                <Select
                  value={s.fontFamily}
                  onValueChange={(v) => set("fontFamily", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((f) => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <StyleColorRow
                label="Text color"
                value={s.textColor}
                onChange={(v) => set("textColor", v)}
              />
            </div>
        </InspectorSection>

        <InspectorSection title="Link">
            <StyleColorRow
              label="Link color"
              value={s.linkColor}
              onChange={(v) => set("linkColor", v)}
            />
        </InspectorSection>

        <InspectorSection title="Button">
            <div className="flex flex-col gap-3">
              <StyleColorRow
                label="Primary bg"
                value={s.buttonBackgroundColor}
                onChange={(v) => set("buttonBackgroundColor", v)}
              />
              <StyleColorRow
                label="Primary text"
                value={s.buttonTextColor}
                onChange={(v) => set("buttonTextColor", v)}
              />
              <StyleColorRow
                label="Secondary bg"
                value={s.secondaryButtonBackgroundColor}
                onChange={(v) => set("secondaryButtonBackgroundColor", v)}
              />
              <StyleColorRow
                label="Secondary text"
                value={s.secondaryButtonTextColor}
                onChange={(v) => set("secondaryButtonTextColor", v)}
              />
              <StyleSliderRow label="Border radius" value={s.buttonRadius}   min={0}  max={24} suffix="px" onChange={(v) => set("buttonRadius",   v)} />
              <StyleSliderRow label="Vert. padding"  value={s.buttonPaddingY} min={6}  max={28} suffix="px" onChange={(v) => set("buttonPaddingY", v)} />
              <StyleSliderRow label="Horiz. padding" value={s.buttonPaddingX} min={8}  max={40} suffix="px" onChange={(v) => set("buttonPaddingX", v)} />
              <StyleSliderRow label="Font size"      value={s.buttonFontSize} min={12} max={22} suffix="px" onChange={(v) => set("buttonFontSize",  v)} />
            </div>
        </InspectorSection>

        <InspectorSection title="Divider">
            <p className="text-xs text-muted-foreground">
              1px solid line. Color inherits from the border token.
            </p>
        </InspectorSection>

        <InspectorSection title="Layout">
            <div className="flex flex-col gap-3">
              <StyleSliderRow label="Max width"    value={s.maxWidth} min={480} max={760} suffix="px" onChange={(v) => set("maxWidth", v)} />
              <StyleSliderRow label="Side padding" value={s.padding}  min={0}   max={48}  suffix="px" onChange={(v) => set("padding",  v)} />
              <StyleSliderRow label="Radius"       value={s.radius}   min={0}   max={24}  suffix="px" onChange={(v) => set("radius",   v)} />
            </div>
        </InspectorSection>

        <InspectorSection title="Shadow">
            <div className="flex flex-col gap-3">
              <Field>
                <FieldLabel>Email shadow</FieldLabel>
                <OptionToggle
                  ariaLabel="Email shadow"
                  value={s.shadowEnabled ? "on" : "off"}
                  onChange={(v) => set("shadowEnabled", v === "on")}
                  options={[
                    { value: "on", label: "On" },
                    { value: "off", label: "Off" },
                  ]}
                />
              </Field>
              {/* Colour and opacity are one control here: the compiler already
                  folds them together through hexToRgba when it builds the
                  box-shadow. */}
              <StyleColorRow
                label="Color"
                value={s.shadowColor}
                onChange={(v) => set("shadowColor", v)}
                opacity={s.shadowOpacity}
                onOpacityChange={(v) => set("shadowOpacity", v)}
              />
              <StyleSliderRow label="Blur" value={s.shadowBlur} min={0} max={80} suffix="px" onChange={(v) => set("shadowBlur", v)} />
              <StyleSliderRow label="Spread" value={s.shadowSpread} min={-12} max={24} suffix="px" onChange={(v) => set("shadowSpread", v)} />
              <StyleSliderRow label="Offset X" value={s.shadowOffsetX} min={-40} max={40} suffix="px" onChange={(v) => set("shadowOffsetX", v)} />
              <StyleSliderRow label="Offset Y" value={s.shadowOffsetY} min={-20} max={60} suffix="px" onChange={(v) => set("shadowOffsetY", v)} />
            </div>
        </InspectorSection>
      </div>
    </div>
  );
}

function ThemePresetOption({ preset }: { preset: ThemePreset }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <ThemePresetSwatches preset={preset} />
      <span className="truncate">{preset.name}</span>
    </span>
  );
}

function ThemePresetSwatches({ preset }: { preset: ThemePreset }) {
  return (
    <span className="flex shrink-0 overflow-hidden rounded-sm border">
      <span
        className="size-3.5"
        style={{ backgroundColor: preset.settings.backgroundColor }}
      />
      <span
        className="size-3.5"
        style={{ backgroundColor: preset.settings.contentColor }}
      />
      <span
        className="size-3.5"
        style={{ backgroundColor: preset.settings.accentColor }}
      />
      <span
        className="size-3.5"
        style={{ backgroundColor: preset.settings.textColor }}
      />
    </span>
  );
}

export function StyleColorRow({
  label,
  value,
  onChange,
  opacity,
  onOpacityChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Percent 0-100; shows the opacity cell when paired with a handler. */
  opacity?: number;
  onOpacityChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 shrink-0 text-[11px] text-muted-foreground">
        {label}
      </label>
      <ColorField
        value={value}
        allowTransparent={false}
        onChange={(v) => onChange(v ?? "#000000")}
        opacity={opacity}
        onOpacityChange={onOpacityChange}
      />
    </div>
  );
}

export function StyleSliderRow({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 shrink-0 text-[11px] text-muted-foreground">{label}</label>
      <RangeSlider
        value={value}
        min={min}
        max={max}
        onValueChange={onChange}
        aria-label={label}
        className="h-7 flex-1 rounded-md"
      />
      <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {value}{suffix}
      </span>
    </div>
  );
}
