import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AralGo",
  description: "AI study companion for Filipino learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
