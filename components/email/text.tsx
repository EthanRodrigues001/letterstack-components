import type * as React from "react"

import { BlockRow, type BlockRowProps } from "./block-row"
import { resolveTheme, type EmailTheme } from "./theme"

export type TextProps = BlockRowProps & {
  align?: "left" | "center" | "right"
  color?: string
  theme?: Partial<EmailTheme>
  children: React.ReactNode
}

/** A paragraph of body copy. */
export function Text({
  align = "left",
  color,
  theme,
  children,
  ...row
}: TextProps) {
  const t = resolveTheme(theme)

  return (
    <BlockRow {...row}>
      <tr>
        <td
          align={align}
          style={{ padding: `8px ${t.padding}px 16px ${t.padding}px` }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              color: color ?? t.textColor,
              fontFamily: t.fontFamily,
              fontSize: 16,
              lineHeight: 1.65,
            }}
          >
            {children}
          </p>
        </td>
      </tr>
    </BlockRow>
  )
}
