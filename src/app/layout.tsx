import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blitz — Real-Time Prediction Markets",
  description:
    "Predict the next 10 minutes, not the next 90. Real-time prediction markets powered by Solana that live and die during a live match.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Blitz — Real-Time Prediction Markets",
    description:
      "Predict the next 10 minutes, not the next 90. Micro-markets that resolve in minutes, settled on-chain via Solana.",
    url: "https://blitz-pied.vercel.app",
    siteName: "Blitz",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blitz — Real-Time Prediction Markets",
    description:
      "Predict the next 10 minutes, not the next 90. Micro-markets settled on Solana.",
  },
  metadataBase: new URL("https://blitz-pied.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="relative">{children}</body>
    </html>
  );
}
