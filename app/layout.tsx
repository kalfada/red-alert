import type { Metadata, Viewport } from "next";
import Header from "./components/Header";
import "./globals.css";
import { UpdateTimeProvider } from './context/UpdateTimeContext';
import { Noto_Sans_Hebrew } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({ subsets: ["hebrew", "latin"] });

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
      <body className={`${notoSansHebrew.className} antialiased`}>
        <UpdateTimeProvider>
          <Header />
          {children}
        </UpdateTimeProvider>
      </body>
    </html>
  );
}
