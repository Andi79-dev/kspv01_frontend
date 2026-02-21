import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthInitializer from "@/components/AuthInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";
import ApiStatusBanner from "@/components/ApiStatusBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RBAC System",
  description: "Role-Based Access Control Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ApiStatusBanner />
          <Providers>
            <AuthInitializer>{children}</AuthInitializer>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
