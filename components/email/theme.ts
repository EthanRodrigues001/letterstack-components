/**
 * The look every email component reads from. Same shape as the editor's
 * document settings, so a theme built in the editor's theme panel can be
 * pasted straight in here.
 *
 * This file is yours — change the values below to restyle every component at
 * once, or pass `theme` to a single component to override it just there.
 */
export type EmailTheme = {
  backgroundColor: string
  contentColor: string
  accentColor: string
  linkColor: string
  textColor: string
  fontFamily: string
  maxWidth: number
  padding: number
  radius: number
  shadowEnabled: boolean
  shadowColor: string
  shadowOpacity: number
  shadowBlur: number
  shadowSpread: number
  shadowOffsetX: number
  shadowOffsetY: number
  buttonBackgroundColor: string
  buttonTextColor: string
  secondaryButtonBackgroundColor: string
  secondaryButtonTextColor: string
  buttonRadius: number
  buttonPaddingY: number
  buttonPaddingX: number
  buttonFontSize: number
}

export const emailTheme: EmailTheme = {
  backgroundColor: "#f0ece8",
  contentColor: "#ffffff",
  accentColor: "#E05C3A",
  linkColor: "#E05C3A",
  textColor: "#1a1a1a",
  fontFamily: "Arial, Helvetica, sans-serif",
  maxWidth: 600,
  padding: 24,
  radius: 8,
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowOpacity: 10,
  shadowBlur: 28,
  shadowSpread: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 14,
  buttonBackgroundColor: "#E05C3A",
  buttonTextColor: "#ffffff",
  secondaryButtonBackgroundColor: "#ffffff",
  secondaryButtonTextColor: "#E05C3A",
  buttonRadius: 6,
  buttonPaddingY: 14,
  buttonPaddingX: 18,
  buttonFontSize: 15,
}

export function resolveTheme(theme?: Partial<EmailTheme>): EmailTheme {
  return theme ? { ...emailTheme, ...theme } : emailTheme
}

export function containerShadow(t: EmailTheme): string {
  if (!t.shadowEnabled) return "none"

  const hex = t.shadowColor.trim().replace("#", "")
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex
  const n = Number.parseInt(full, 16)
  const [r, g, b] = Number.isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]

  return `${t.shadowOffsetX}px ${t.shadowOffsetY}px ${t.shadowBlur}px ${t.shadowSpread}px rgba(${r}, ${g}, ${b}, ${t.shadowOpacity / 100})`
}
