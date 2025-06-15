import type { Metadata } from "next";
import Header from "./components/Header";
import "./globals.css";
import { UpdateTimeProvider } from './context/UpdateTimeContext';
import { MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "התרעות אמת",
  description: "התרעות אמת",
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
