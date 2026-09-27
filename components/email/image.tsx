import { BlockRow, type BlockRowProps } from "./block-row"
import { resolveTheme, type EmailTheme } from "./theme"

export type ImageProps = BlockRowProps & {
  src: string
  alt: string
  /** Percentage of the content width, 1–100. */
  width?: number
  /** Makes the image a link. */
  href?: string
  theme?: Partial<EmailTheme>
}

export function Image({
  src,
  alt,
  width = 100,
  href,
  theme,
  ...row
}: ImageProps) {
  const t = resolveTheme(theme)

  // Outlook ignores CSS widths on images, so the width attribute carries the
  // real pixel size and the style handles everything else.
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- this is email HTML, not a page
    <img
      src={src}
      alt={alt}
      width={Math.round((t.maxWidth * width) / 100)}
      style={{
        display: "block",
        margin: "0 auto",
        width: `${width}%`,
        maxWidth: t.maxWidth,
        height: "auto",
        border: 0,
      }}
    />
  )

  return (
    <BlockRow {...row}>
      <tr>
        <td align="center" style={{ padding: 0 }}>
          {href ? (
            <a href={href} style={{ display: "block", textDecoration: "none" }}>
              {img}
            </a>
          ) : (
            img
          )}
        </td>
      </tr>
    </BlockRow>
  )
}
