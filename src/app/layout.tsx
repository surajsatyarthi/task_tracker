import type { Metadata } from "next";
import { Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Task Tracker - Eisenhower Matrix",
  description: "Professional task management with Eisenhower Matrix prioritization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gradient-to-br from-slate-50 to-gray-100`}
        style={{ fontFamily: 'var(--font-lato), sans-serif' }}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
