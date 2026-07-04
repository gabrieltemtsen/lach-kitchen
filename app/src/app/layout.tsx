import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/providers";

export const metadata: Metadata = {
  title: "Lach Eat & Smile Kitchen — Fresh Naija comfort food in Lekki",
  description:
    "Order Efo Riro, Akara, Masa and more — made fresh in Lekki Phase 1, Lagos. Order online, pay by transfer, and smile.",
  icons: { icon: "/media/logo.png" },
  openGraph: {
    title: "Lach Eat & Smile Kitchen",
    description:
      "Fresh Naija comfort food in Lekki — Efo Riro, Akara, Masa & more. Order online.",
    images: ["/media/efo-riro-1.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
