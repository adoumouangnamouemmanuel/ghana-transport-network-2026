import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Ghana Transport Network",
  description:
    "Interactive explorer for the Ghana Road Transport Network — 183 towns, 551 roads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className="min-h-screen text-gray-100 antialiased font-outfit"
        style={{ background: "#030612" }}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#e2e8f0",
              border: "1px solid #1a2332",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#111827" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#111827" } },
          }}
        />
      </body>
    </html>
  );
}
