import { BarChart3, Calendar, LogOut, User } from 'lucide-react';
import React from 'react';
import { Form, Link } from 'react-router';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface HeaderProps {
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'owner': return 'Właściciel';
      case 'employee': return 'Pracownik';
      case 'client': return 'Klient';
      default: return role || 'Użytkownik';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <BarChart3 className="w-4 h-4" />;
      case 'employee': return <Calendar className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                ReservePro
              </Link>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                {getRoleIcon(user.role)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
              
              <Form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Wyloguj</span>
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
