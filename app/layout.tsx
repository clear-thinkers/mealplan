import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Diet Planning",
  description: "Private family diet planning and logging app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
