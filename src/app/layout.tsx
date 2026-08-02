import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "InertiaHub | High-Performance Distributed Cloud & Edge Engine",
    template: "%s | InertiaHub",
  },
  description:
    "The next-generation distributed edge runtime for modern cloud microservices, sub-millisecond execution, and global compute infrastructure.",
  keywords: [
    "InertiaHub",
    "Edge Runtime",
    "Cloud Compute",
    "Microservices",
    "Distributed Systems",
    "Zero-Trust Architecture",
    "API Gateway",
  ],
  authors: [{ name: "InertiaHub Engineering Team" }],
  openGraph: {
    title: "InertiaHub | High-Performance Cloud & Edge Runtime",
    description:
      "Sub-millisecond global execution, zero-trust security architecture, and distributed cloud computing.",
    url: "https://inertiahub.xyz",
    siteName: "InertiaHub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InertiaHub Platform",
    description: "Next-gen distributed cloud compute & edge infrastructure.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-600 selection:text-white flex flex-col">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
