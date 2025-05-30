
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { LogOut, User, Store, Menu, X } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userRole, currentUser } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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

          {/* Desktop Navigation */}
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

          {/* Desktop Auth Section */}
          <div className="header-auth hidden md:flex items-center space-x-4">
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
                  className="btn-signout flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/businesses" 
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Businesses
              </Link>
              {user && userRole === 'business' && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>
            
            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="user-avatar w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentUser?.name || user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
