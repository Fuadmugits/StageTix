import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: "StageTix - Next-Gen Concert Ticketing & Payment Gateway",
  description: "Secure concert ticket booking platform integrated with custom Laravel payment gateway engine & Supabase Auth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-TXkuAbg23IjtASqb';

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Midtrans Snap Script for Sandbox */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={midtransClientKey}
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pt-20">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
