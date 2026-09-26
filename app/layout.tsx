import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi habitación",
  description: "Plano y vista 3D de tu habitación con medidas reales.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
