import type * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

/**
 * Turns an <Email> tree into the HTML string you hand to your email provider
 * (Resend, SES, Postmark, nodemailer...).
 *
 *   const html = renderEmail(<Welcome name="Ada" />)
 */
export function renderEmail(email: React.ReactElement): string {
  return `<!doctype html>${renderToStaticMarkup(email)}`
}
