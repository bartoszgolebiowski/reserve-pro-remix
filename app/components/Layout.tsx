import React from 'react';
import { Header } from './Header';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface LayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main>
        {children}
      </main>
    </div>
  );
};
