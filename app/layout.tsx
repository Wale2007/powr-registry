import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "POWR.PRO — The Truth Layer of Web3",
  description:
    "A decentralized reputation protocol that verifies Web3 builders and farmers to prevent Sybil attacks. Prove your identity. Build your reputation.",
  icons: {
    icon: "/powr_logo.png",
    shortcut: "/powr_logo.png",
    apple: "/powr_logo.png",
  },
};

import UsernameGate from "./components/UsernameGate";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen antialiased font-sans" style={{ background: "#0B1120", color: "#F1F5F9" }}>
        <UsernameGate>
          {children}
        </UsernameGate>
      </body>
    </html>
  );
}
