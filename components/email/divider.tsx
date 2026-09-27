import { BlockRow, type BlockRowProps } from "./block-row"
import { resolveTheme, type EmailTheme } from "./theme"

export type DividerProps = BlockRowProps & {
  /** Line colour. Drawn at 24% opacity, so the text colour works well. */
  color?: string
  theme?: Partial<EmailTheme>
}

export function Divider({ color, theme, ...row }: DividerProps) {
  const t = resolveTheme(theme)

  return (
    <BlockRow {...row}>
      <tr>
        <td style={{ padding: `8px ${t.padding}px 28px ${t.padding}px` }}>
          {/* a 1px div with content, not <hr>: Outlook draws <hr> its own way */}
          <div
            style={{
              height: 1,
              background: color ?? t.textColor,
              opacity: 0.24,
              lineHeight: "1px",
              fontSize: 1,
            }}
          >
            &nbsp;
          </div>
        </td>
      </tr>
    </BlockRow>
  )
}
