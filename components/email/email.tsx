import type * as React from "react"

import { containerShadow, resolveTheme, type EmailTheme } from "./theme"

// Stacks columns on phones. Harmless when there are no columns.
const RESPONSIVE_CSS = `
@media only screen and (max-width:480px) {
  .ls-col { display:block !important; width:100% !important; box-sizing:border-box; }
  .ls-gap { display:none !important; }
  .ls-col.ls-row { display:table-cell !important; width:auto !important; }
}`

export type EmailProps = {
  /** Shows in the <title>, which some clients use for the tab or window. */
  title?: string
  /** The grey line inbox lists show next to the subject. */
  preview?: string
  theme?: Partial<EmailTheme>
  children: React.ReactNode
}

/**
 * The outer document: <html>, the background, and the centred content card.
 * Every block goes inside it.
 */
export function Email({ title = "", preview, theme, children }: EmailProps) {
  const t = resolveTheme(theme)

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{title}</title>
        <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: t.backgroundColor }}>
        {preview && (
          <div
            style={{
              display: "none",
              maxHeight: 0,
              overflow: "hidden",
              opacity: 0,
              color: "transparent",
            }}
          >
            {preview}
          </div>
        )}
        <table
          role="presentation"
          width="100%"
          cellSpacing={0}
          cellPadding={0}
          border={0}
          style={{ background: t.backgroundColor, width: "100%" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: `${t.padding}px 12px` }}>
                <table
                  role="presentation"
                  width="100%"
                  cellSpacing={0}
                  cellPadding={0}
                  border={0}
                  style={{
                    width: "100%",
                    maxWidth: t.maxWidth,
                    background: t.contentColor,
                    borderRadius: t.radius,
                    overflow: "hidden",
                    boxShadow: containerShadow(t),
                  }}
                >
                  <tbody>{children}</tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
