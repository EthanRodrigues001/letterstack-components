import type * as React from "react"

import { BlockRow, type BlockRowProps } from "./block-row"
import { resolveTheme, type EmailTheme } from "./theme"

type Align = "left" | "center" | "right"

export type ButtonLinkProps = {
  href: string
  variant?: "primary" | "secondary"
  /** Fill the content width instead of hugging the label. */
  fullWidth?: boolean
  theme?: Partial<EmailTheme>
  children: React.ReactNode
}

/**
 * Just the styled link, no row around it. Use it inside <ButtonGroup>, or
 * anywhere you need a button inside your own markup.
 */
export function ButtonLink({
  href,
  variant = "primary",
  fullWidth = false,
  theme,
  children,
}: ButtonLinkProps) {
  const t = resolveTheme(theme)
  const secondary = variant === "secondary"

  return (
    <a
      href={href}
      style={{
        ...(fullWidth
          ? {
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              margin: "0 0 8px 0",
            }
          : { display: "inline-block", margin: "0 6px 8px 0" }),
        background: secondary
          ? t.secondaryButtonBackgroundColor
          : t.buttonBackgroundColor,
        color: secondary ? t.secondaryButtonTextColor : t.buttonTextColor,
        border: secondary
          ? `1px solid ${t.secondaryButtonTextColor}`
          : "1px solid transparent",
        textDecoration: "none",
        fontFamily: t.fontFamily,
        fontSize: t.buttonFontSize,
        fontWeight: 700,
        lineHeight: 1,
        padding: `${t.buttonPaddingY}px ${t.buttonPaddingX}px`,
        borderRadius: t.buttonRadius,
      }}
    >
      {children}
    </a>
  )
}

export type ButtonGroupProps = BlockRowProps & {
  align?: Align
  theme?: Partial<EmailTheme>
  children: React.ReactNode
}

/** Several <ButtonLink>s side by side, e.g. a primary and a secondary action. */
export function ButtonGroup({
  align = "left",
  theme,
  children,
  ...row
}: ButtonGroupProps) {
  const t = resolveTheme(theme)

  return (
    <BlockRow {...row}>
      <tr>
        <td
          align={align}
          style={{ padding: `4px ${t.padding}px 12px ${t.padding}px` }}
        >
          {children}
        </td>
      </tr>
    </BlockRow>
  )
}

export type ButtonProps = ButtonLinkProps &
  BlockRowProps & {
    align?: Align
  }

export function Button({
  align = "left",
  backgroundColor,
  paddingTop,
  paddingBottom,
  ...link
}: ButtonProps) {
  return (
    <ButtonGroup
      align={link.fullWidth ? "center" : align}
      theme={link.theme}
      backgroundColor={backgroundColor}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
    >
      <ButtonLink {...link} />
    </ButtonGroup>
  )
}
