import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar, Main content, and Footer now take full width since sidebar is hidden by default */}
      <div className="">
        <Navbar />
      </div>
      <main className="transition-all duration-300 ease-in-out">
        <div className="">
          {children}
        </div>
      </main>
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
