import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI e professione forense - Pre-training Assessment",
  description:
    "Valutazione pre-formativa per il corso AI per avvocati - DigiCrazy Lab",
  keywords: ["AI", "avvocati", "formazione", "intelligenza artificiale"],
  authors: [{ name: "DigiCrazy Lab" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
