import {
  initialEmailDocument,
  type EmailDocumentSettings,
} from "@/lib/email/document"

/**
 * The look every email component reads from. Same shape as the editor's
 * document settings, so a theme built in the editor's theme panel can be
 * pasted straight in here.
 *
 * This file is yours — change the values below to restyle every component at
 * once, or pass `theme` to a single component to override it just there.
 */
export type EmailTheme = Omit<EmailDocumentSettings, "previewText">

const { previewText: _previewText, ...editorDefaults } =
  initialEmailDocument.settings

export const emailTheme: EmailTheme = {
  ...editorDefaults,
}

export function resolveTheme(theme?: Partial<EmailTheme>): EmailTheme {
  return theme ? { ...emailTheme, ...theme } : emailTheme
}
