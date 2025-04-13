import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AdoptablePH",
  description: "Find your perfect pet companion",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">
            <main className="container mx-auto px-4">{children}</main>
          </div>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
