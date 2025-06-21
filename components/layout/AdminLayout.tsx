import AdminNavbar from "@/components/layout/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminNavbar>
      {children}
    </AdminNavbar>
  );
}
