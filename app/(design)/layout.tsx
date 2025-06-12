import { DesignProvider } from '@/contexts/DesignContext';

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignProvider>
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </DesignProvider>
  );
}
