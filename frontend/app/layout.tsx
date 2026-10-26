import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shetkari Sathi | शेतकरी साथी — Digital Agriculture & Schemes Platform",
  description:
    "Empowering Indian & Maharashtra farmers with 90% solar pump subsidies, government schemes, crop marketplace, tractor hiring, farm labour, and Kisan Sathi AI Chatbot.",
  keywords: [
    "Shetkari Sathi",
    "PM-KUSUM",
    "PM-KISAN",
    "Maharashtra Farmer Schemes",
    "Agriculture Marketplace",
    "Tractor Booking",
    "Mandi Rates",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
