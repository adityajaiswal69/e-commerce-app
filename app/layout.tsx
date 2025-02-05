import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/contexts/CartContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
