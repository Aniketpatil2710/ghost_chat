import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "./providers/AuthProvider";
import Header from "./components/layout/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost Chat — Anonymous Messaging",
  description:
    "Privacy-first anonymous messaging platform. No email, no phone, no identity required. Communicate freely with device-based anonymous identities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
