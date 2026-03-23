import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  title: "Trash Pandas 14U",
  description: "Official home of the Trash Pandas 14U baseball club — photos, videos, and more.",
  icons: {
    icon: "/logos/tp-icon.png",
    apple: "/logos/tp-icon.png",
  },
  openGraph: {
    title: "Trash Pandas 14U",
    description: "Photos and videos from the Trash Pandas 14U baseball club.",
    images: ["/logos/tp-purple.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d0d0d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0d0d0d] text-white`}>
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#2a2a2a] py-6 text-center text-[#8a8a8a] text-sm">
          <p>Trash Pandas 14U &mdash; Play hard, have fun.</p>
        </footer>
      </body>
    </html>
  );
}
