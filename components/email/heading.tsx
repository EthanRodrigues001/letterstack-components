import type * as React from "react"

import { BlockRow, type BlockRowProps } from "./block-row"
import { resolveTheme, type EmailTheme } from "./theme"

const SIZES = { 1: 32, 2: 24, 3: 18 } as const

export type HeadingProps = BlockRowProps & {
  level?: 1 | 2 | 3
  align?: "left" | "center" | "right"
  color?: string
  theme?: Partial<EmailTheme>
  children: React.ReactNode
}

export function Heading({
  level = 1,
  align = "left",
  color,
  theme,
  children,
  ...row
}: HeadingProps) {
  const t = resolveTheme(theme)
  const Tag = `h${level}` as const

  return (
    <BlockRow {...row}>
      <tr>
        <td
          align={align}
          style={{ padding: `24px ${t.padding}px 12px ${t.padding}px` }}
        >
          <Tag
            style={{
              margin: 0,
              color: color ?? t.textColor,
              fontFamily: t.fontFamily,
              fontSize: SIZES[level],
              lineHeight: 1.2,
              fontWeight: 800,
            }}
          >
            {children}
          </Tag>
        </td>
      </tr>
    </BlockRow>
  )
}
