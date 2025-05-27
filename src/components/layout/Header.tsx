
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { LogOut, User, Store } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userRole, currentUser } = useAppStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="header bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="header-logo flex items-center space-x-2">
            <div className="logo-icon w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LoyaltyApp</span>
          </Link>

          {/* Navigation */}
          <nav className="header-nav hidden md:flex items-center space-x-6">
            <Link 
              to="/businesses" 
              className="nav-link text-gray-600 hover:text-purple-600 transition-colors"
            >
              Businesses
            </Link>
            {user && userRole === 'business' && (
              <Link 
                to="/dashboard" 
                className="nav-link text-gray-600 hover:text-purple-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="header-auth flex items-center space-x-4">
            {user ? (
              <div className="user-section flex items-center space-x-3">
                <div className="user-info flex items-center space-x-2">
                  <div className="user-avatar w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="user-name text-sm font-medium text-gray-900">
                    {currentUser?.name || user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="btn-signout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="auth-buttons flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="btn-login"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="btn-register"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
