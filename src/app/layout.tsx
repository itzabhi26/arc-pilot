import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "ARC Pilot — AI Financial Operating System for ARC",
  description:
    "ARC Pilot is the AI-powered smart wallet and financial co-pilot for the ARC network. Monitor spend, understand trends, and move funds with an agent that actually watches your wallet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the theme class before first paint to avoid a light-mode flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
