"use client";

import Color from "color";
import { PipetteIcon } from "lucide-react";
import { Slider } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ColorPickerContextValue {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  mode: string;
  setHue: (hue: number) => void;
  setSaturation: (saturation: number) => void;
  setLightness: (lightness: number) => void;
  setAlpha: (alpha: number) => void;
  setMode: (mode: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider");
  }
  return context;
};

export type ColorPickerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value?: string;
  defaultValue?: string;
  /** Receives [r, g, b, a], alpha as 0-1, matching the shadcn original. */
  onChange?: (value: [number, number, number, number]) => void;
};

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const initial = useMemo(() => {
    try {
      return Color(value ?? defaultValue);
    } catch {
      return Color("#000000");
    }
    // Only the first paint seeds the sliders; later updates arrive through the
    // sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seeded straight from the parsed colour. Upstream used `|| ` fallbacks here
  // (`saturationl() || 100`, `lightness() || 50`), which treat a legitimate 0
  // as missing: every greyscale colour came in at full saturation, and pure
  // black opened as mid-grey.
  const [hue, setHue] = useState(() => initial.hue());
  const [saturation, setSaturation] = useState(() => initial.saturationl());
  const [lightness, setLightness] = useState(() => initial.lightness());
  const [alpha, setAlpha] = useState(() => initial.alpha() * 100);
  const [mode, setMode] = useState("hex");

  /** The colour we opened with; emitting this back would be a no-op write. */
  const initialHexa = useMemo(
    () =>
      Color.hsl(
        initial.hue(),
        initial.saturationl(),
        initial.lightness()
      )
        .alpha(initial.alpha())
        .hexa(),
    [initial]
  );

  // Sync from a controlled value. The upstream version read RGB channels here
  // and wrote them straight into the HSL state (hue = r, saturation = g,
  // lightness = b), which scrambled the colour on every external update. This
  // reads HSL, and skips the echo of our own onChange so the two effects do
  // not chase each other.
  const lastEmitted = useRef<string | null>(null);
  useEffect(() => {
    if (value === undefined) return;
    let incoming: ReturnType<typeof Color>;
    try {
      incoming = Color(value);
    } catch {
      return;
    }
    if (lastEmitted.current === incoming.hexa()) return;
    const [h, s, l] = incoming.hsl().array();
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(incoming.alpha() * 100);
  }, [value]);

  // onChange is held in a ref rather than listed as a dependency. Upstream had
  // it in the dep array, so any caller passing an inline arrow re-ran this
  // effect on every render: emit -> parent state update -> re-render -> new
  // function identity -> emit, until React bailed out with "Maximum update
  // depth exceeded".
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Nor does it emit while the colour still equals the one we opened with, so
  // merely opening the picker never writes back. A mount flag is not enough:
  // React runs effects twice in StrictMode and refs survive that, so the second
  // pass would fire — which is how opening a transparent swatch turned it
  // white. Comparing the value is idempotent, so the double invoke is harmless.
  const hasEmitted = useRef(false);
  useEffect(() => {
    const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
    const hexa = color.hexa();
    if (!hasEmitted.current && hexa === initialHexa) return;
    hasEmitted.current = true;
    lastEmitted.current = hexa;
    const rgba = color.rgb().array();
    onChangeRef.current?.([rgba[0], rgba[1], rgba[2], alpha / 100]);
  }, [hue, saturation, lightness, alpha, initialHexa]);

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div
        className={cn("flex size-full flex-col gap-4", className)}
        {...props}
      />
    </ColorPickerContext.Provider>
  );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = memo(
  ({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const { hue, setSaturation, setLightness } = useColorPicker();

    const backgroundGradient = useMemo(
      () =>
        [
          "linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0))",
          "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0))",
          "hsl(" + hue + ", 100%, 50%)",
        ].join(", "),
      [hue]
    );

    const handlePointerMove = useCallback(
      (event: PointerEvent) => {
        if (!(isDragging && containerRef.current)) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height)
        );
        setPositionX(x);
        setPositionY(y);
        setSaturation(x * 100);
        const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
        setLightness(topLightness * (1 - y));
      },
      [isDragging, setSaturation, setLightness]
    );

    useEffect(() => {
      const handlePointerUp = () => setIsDragging(false);
      if (isDragging) {
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
      }
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }, [isDragging, handlePointerMove]);

    return (
      <div
        className={cn("relative size-full cursor-crosshair rounded", className)}
        onPointerDown={(event) => {
          event.preventDefault();
          setIsDragging(true);
          handlePointerMove(event.nativeEvent);
        }}
        ref={containerRef}
        style={{ background: backgroundGradient }}
        {...props}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            left: positionX * 100 + "%",
            top: positionY * 100 + "%",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    );
  }
);

ColorPickerSelection.displayName = "ColorPickerSelection";

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>;

export const ColorPickerHue = ({
  className,
  ...props
}: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker();
  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={360}
      onValueChange={([next]) => setHue(next)}
      step={1}
      value={[hue]}
      {...props}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Slider.Range className="absolute h-full" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
};

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>;

const ALPHA_CHECKERBOARD =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center';

export const ColorPickerAlpha = ({
  className,
  ...props
}: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker();
  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={100}
      onValueChange={([next]) => setAlpha(next)}
      step={1}
      value={[alpha]}
      {...props}
    >
      <Slider.Track
        className="relative my-0.5 h-3 w-full grow rounded-full"
        style={{ background: ALPHA_CHECKERBOARD }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50" />
        <Slider.Range className="absolute h-full rounded-full bg-transparent" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({
  className,
  ...props
}: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const [h, s, l] = Color(result.sRGBHex).hsl().array();
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setAlpha(100);
    } catch (error) {
      console.error("EyeDropper failed:", error);
    }
  };

  return (
    <Button
      className={cn("shrink-0 text-muted-foreground", className)}
      onClick={handleEyeDropper}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  );
};

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ["hex", "rgb", "css", "hsl"];

export const ColorPickerOutput = ({
  className,
  ...props
}: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker();
  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger
        className={cn("h-8 w-20 shrink-0 text-xs", className)}
        {...props}
      >
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type PercentageInputProps = ComponentProps<typeof Input>;

const PercentageInput = ({ className, ...props }: PercentageInputProps) => (
  <div className="relative">
    <Input
      readOnly
      type="text"
      {...props}
      className={cn(
        "h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 pr-5 text-xs shadow-none",
        className
      )}
    />
    <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
      %
    </span>
  </div>
);

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerFormat = ({
  className,
  ...props
}: ColorPickerFormatProps) => {
  const {
    hue,
    saturation,
    lightness,
    alpha,
    mode,
    setHue,
    setSaturation,
    setLightness,
    setAlpha,
  } = useColorPicker();
  const color = Color.hsl(hue, saturation, lightness, alpha / 100);

  // Hex is typeable, unlike upstream where every readout was readOnly. The
  // draft is held locally so half-typed values ("#3f") do not get parsed and
  // thrown away mid-keystroke; it clears on blur and the canonical hex returns.
  const [draft, setDraft] = useState<string | null>(null);

  if (mode === "hex") {
    return (
      <div
        className={cn(
          "relative flex w-full items-center -space-x-px rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        <Input
          className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none"
          type="text"
          spellCheck={false}
          value={draft ?? color.hex()}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            try {
              const parsed = Color(next.startsWith("#") ? next : "#" + next);
              const [h, s, l] = parsed.hsl().array();
              setHue(h);
              setSaturation(s);
              setLightness(l);
            } catch {
              // Incomplete input — keep the draft, leave the colour alone.
            }
          }}
          onBlur={() => setDraft(null)}
        />
        <PercentageInput
          value={Math.round(alpha)}
          readOnly={false}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            setAlpha(Math.min(100, Math.max(0, next)));
          }}
        />
      </div>
    );
  }

  if (mode === "rgb") {
    const rgb = color.rgb().array().map(Math.round);
    return (
      <div
        className={cn(
          "flex items-center -space-x-px rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        {rgb.map((channel, index) => (
          <Input
            className={cn(
              "h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none",
              index && "rounded-l-none"
            )}
            key={index}
            readOnly
            type="text"
            value={channel}
          />
        ))}
        <PercentageInput value={Math.round(alpha)} />
      </div>
    );
  }

  if (mode === "css") {
    const rgb = color.rgb().array().map(Math.round);
    return (
      <div className={cn("w-full rounded-md shadow-sm", className)} {...props}>
        <Input
          className="h-8 w-full bg-secondary px-2 text-xs shadow-none"
          readOnly
          type="text"
          value={"rgba(" + rgb.join(", ") + ", " + Math.round(alpha) + "%)"}
        />
      </div>
    );
  }

  if (mode === "hsl") {
    const hsl = color.hsl().array().map(Math.round);
    return (
      <div
        className={cn(
          "flex items-center -space-x-px rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        {hsl.map((channel, index) => (
          <Input
            className={cn(
              "h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none",
              index && "rounded-l-none"
            )}
            key={index}
            readOnly
            type="text"
            value={channel}
          />
        ))}
        <PercentageInput value={Math.round(alpha)} />
      </div>
    );
  }

  return null;
};
