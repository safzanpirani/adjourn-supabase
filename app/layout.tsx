import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import SwRegister from "@/components/sw-register"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Adjourn - Take a break",
  description: "A minimalist journaling app for mindful writing",
  manifest: "/manifest.json",
  themeColor: "#5D6D4E",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Adjourn" />
        <link rel="apple-touch-icon" href="/adjourn-typewriter.png" />
      </head>
      <body
        className={inter.className}
        style={{ fontFamily: "var(--font-family-base, inherit)", fontSize: "var(--font-size-base, 16px)" }}
      >
        <ThemeProvider>
          <Providers>
            {children}
            <SwRegister />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
