import type * as React from "react"

/**
 * Every block is one row of the email's content table. This is the optional
 * wrapper the compiler puts around a block when it has its own background or
 * vertical padding.
 */
export type BlockRowProps = {
  backgroundColor?: string
  paddingTop?: number
  paddingBottom?: number
}

export function BlockRow({
  backgroundColor,
  paddingTop = 0,
  paddingBottom = 0,
  children,
}: BlockRowProps & { children: React.ReactNode }) {
  if (!backgroundColor && !paddingTop && !paddingBottom) return <>{children}</>

  return (
    <tr>
      <td
        style={{
          background: backgroundColor,
          paddingTop: paddingTop || undefined,
          paddingBottom: paddingBottom || undefined,
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellSpacing={0}
          cellPadding={0}
          border={0}
        >
          <tbody>{children}</tbody>
        </table>
      </td>
    </tr>
  )
}
