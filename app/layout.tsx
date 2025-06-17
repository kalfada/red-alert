import type { Metadata, Viewport } from "next";
import Header from "./components/Header";
import "./globals.css";
import { UpdateTimeProvider } from './context/UpdateTimeContext';
import { MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "התרעות אמת",
  description: "התרעות אמת - Red Alert Notifications",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "התרעות אמת",
  },
  icons: {
    icon: "/missle.svg",
    shortcut: "/missle.svg",
    apple: "/missle.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "התרעות אמת",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ef4444",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="he" dir="rtl">
      <body
        className={`antialiased`}
      >
        <MantineProvider>
          <UpdateTimeProvider>
            <Header />
            {children}
          </UpdateTimeProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
