
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { LogOut, User, Store } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, currentUser, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header-main bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">LoyaltyPlus</h1>
          </div>

          <nav className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="btn-login"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="btn-register bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {userRole === 'business' ? <Store size={16} /> : <User size={16} />}
                  <span>{currentUser?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  <LogOut size={16} />
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
