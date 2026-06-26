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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon-180x180.png", type: "image/png", sizes: "180x180" },
      { url: "/apple-icon-152x152.png", type: "image/png", sizes: "152x152" },
    ],
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
