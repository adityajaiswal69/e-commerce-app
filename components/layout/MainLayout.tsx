import Navbar from "@/components/layout/Navbar";
import LeftNavBar from "@/components/layout/LeftNavbar";
import Footer from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
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
      <div className="md:ml-64">
        <Footer />
      </div>
    </div>
  );
}
