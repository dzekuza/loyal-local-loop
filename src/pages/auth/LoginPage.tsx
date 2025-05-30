
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { userRole, isAuthenticated } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after authentication state changes
  useEffect(() => {
    console.log('Login page auth state change:', { isAuthenticated, userRole, user });
    
    if (isAuthenticated && userRole && user) {
      console.log('User is authenticated, determining redirect...');
      
      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        if (userRole === 'business') {
          console.log('Redirecting business user to dashboard');
          navigate('/dashboard', { replace: true });
        } else if (userRole === 'customer') {
          console.log('Redirecting customer to businesses page');
          navigate('/businesses', { replace: true });
        } else {
          console.log('Unknown role, redirecting to home');
          navigate('/', { replace: true });
        }
      }, 100);
    }
  }, [userRole, isAuthenticated, user, navigate]);

  return (
    <div className="login-page min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="login-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <p className="text-gray-600">Sign in to your account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input-email"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="input-password"
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-login w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-600 hover:underline">
                    Create one here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
