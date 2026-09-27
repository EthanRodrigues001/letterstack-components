import { BlockRow, type BlockRowProps } from "./block-row"

export type SpacerProps = BlockRowProps & {
  /** In pixels. */
  height?: number
}

export function Spacer({ height = 24, ...row }: SpacerProps) {
  return (
    <BlockRow {...row}>
      <tr>
        <td style={{ height, lineHeight: `${height}px`, fontSize: 1 }}>
          &nbsp;
        </td>
      </tr>
    </BlockRow>
  )
}
