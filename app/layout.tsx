import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * CUSTOMIZE: Update metadata for client branding
 */
export const metadata: Metadata = {
  title: "DemoApp - Dashboard",
  description: "Your product dashboard. Manage your projects, analytics, and team.",
  keywords: ["dashboard", "product", "saas", "platform"],
};

/**
 * Root layout component with dashboard structure.
 * CUSTOMIZE: Update branding and navigation per client requirements.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full bg-background font-sans antialiased`}
      >
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
