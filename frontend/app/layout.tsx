import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ghana Transport Network",
  description: "Interactive explorer for the Ghana Road Transport Network — 183 towns, 551 roads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#1e293b" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
          }}
        />
      </body>
    </html>
  );
}
