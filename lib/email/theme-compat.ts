// Type-only guard, never shipped: components/email/theme.ts copies the
// editor's settings shape so the email components can install without the
// editor's document model. If either side changes, `npm run types:check`
// fails here instead of the two quietly drifting apart.
import type { EmailTheme } from "@/components/email/theme"
import type { EmailDocumentSettings } from "./document"

type EditorTheme = Omit<EmailDocumentSettings, "previewText">
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

export const themeMatchesEditor: Same<EmailTheme, EditorTheme> = true
