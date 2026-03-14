import type { Metadata } from "next";
import { Nunito_Sans, Poppins } from "next/font/google";

import "./globals.css";

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Healthcare Infrastructure SaaS",
  description: "AI Healthcare Infrastructure platform starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
