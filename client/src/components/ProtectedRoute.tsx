import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isHydrating } = useAuthStore();

  useEffect(() => {
    if (!isHydrating && !token) {
      window.location.hash = '#/login';
    }
  }, [token, isHydrating]);

  if (isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#030507]">
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-bold tracking-widest text-white/40 uppercase">Loading Session</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Redirect handled by useEffect
  }

  return <>{children}</>;
}
