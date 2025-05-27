
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { Store, User } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const { toast } = useToast();
  
  const [userType, setUserType] = useState<'business' | 'customer'>('business');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate user login
    const user = {
      id: `user_${Date.now()}`,
      email: formData.email,
      name: userType === 'business' ? 'Demo Business' : 'Demo Customer',
    };

    setUser(user, userType);
    
    toast({
      title: "Login Successful",
      description: `Welcome back!`,
    });

    // Redirect based on user type
    navigate(userType === 'business' ? '/dashboard' : '/businesses');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="login-page min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="login-container max-w-md w-full">
        <Card className="login-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to your LoyaltyPlus account</p>
          </CardHeader>
          
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'business' | 'customer')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Store size={16} />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Customer</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group-email">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-email"
                    required
                  />
                </div>

                <div className="form-group-password">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="input-password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-login w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Sign In
                </Button>
              </form>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
