import { Geist_Mono, Outfit } from "next/font/google"
import "./globals.css";

import type { Metadata } from "next";
import { siteConfig } from "../config/site";

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Cloud platform",
    "Oxyra",
    "Aman Yadav",
    "Next.js",
    "React",
    "Tailwind CSS",
  ],
  authors: [
    {
      name: "Aman Yadav",
      url: "https://github.com/amanyadav-work",
    },
  ],
  creator: "Aman Yadav",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@amanyadav_work",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable)}
    >
      <body>
        <UserProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  )
}
