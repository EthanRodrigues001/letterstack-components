import type * as React from "react"

/**
 * Turns an <Email> tree into the HTML string you hand to your email provider
 * (Resend, SES, Postmark, nodemailer...).
 *
 *   const html = await renderEmail(<Welcome name="Ada" />)
 *
 * react-dom/server is imported lazily because Next.js refuses a static import
 * of it anywhere in server component code — which is exactly where emails
 * tend to get sent from.
 */
export async function renderEmail(email: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server")
  return `<!doctype html>${renderToStaticMarkup(email)}`
}
