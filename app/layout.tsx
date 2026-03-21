import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { LayoutClient } from "./layout-client";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { toast } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "MaJay Transportation",
  description: "MaJay Transportation Management System",
  generator: "",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased w-full min-h-screen`}
      >
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
