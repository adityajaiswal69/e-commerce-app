import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import LeftNavBar from "@/components/layout/LeftNavbar";
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
          <div className="min-h-screen bg-gray-50">
            <LeftNavBar />
            {/* Uncomment the Navbar if you want to use it instead of LeftNavBar */}
            <div className="md:ml-64">
              <Navbar />
            </div>
            <main className="md:ml-64 transition-all duration-300 ease-in-out">
              <div className="">
                {children}
              </div>
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}