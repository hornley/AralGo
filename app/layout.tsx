import type { Metadata, Viewport } from "next";
import "./globals.css";

const serviceWorkerScript =
  process.env.NODE_ENV === "production"
    ? `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    `
    : `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    `;

export const metadata: Metadata = {
  title: {
    default: "AralGo",
    template: "%s — AralGo",
  },
  description: "AI study companion for Filipino learners.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "AralGo",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#456732",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: serviceWorkerScript,
          }}
        />
      </body>
    </html>
  );
}
