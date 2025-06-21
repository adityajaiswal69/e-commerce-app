import { DesignProvider } from '@/contexts/DesignContext';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard
      message="Please sign in first to use the design tool"
      redirectTo="/sign-in"
    >
      <DesignProvider>
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </DesignProvider>
    </AuthGuard>
  );
}
