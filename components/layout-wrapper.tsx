'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import { Footer } from '@/components/footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // For admin routes, don't render header and footer
    return <>{children}</>;
  }

  // For regular routes, render with header and footer
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
      <Footer />
    </>
  );
}
