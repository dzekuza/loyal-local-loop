
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { Store, User } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const { toast } = useToast();
  
  const [userType, setUserType] = useState<'business' | 'customer'>('business');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    businessType: '',
  });

  const businessTypes = [
    'Restaurant', 'Cafe', 'Retail Store', 'Beauty Salon', 
    'Fitness Center', 'Bookstore', 'Pharmacy', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Simulate user registration
    const user = {
      id: `user_${Date.now()}`,
      email: formData.email,
      name: formData.name,
      ...(userType === 'business' && { businessType: formData.businessType }),
    };

    setUser(user, userType);
    
    toast({
      title: "Registration Successful",
      description: `Welcome to LoyaltyPlus, ${formData.name}!`,
    });

    // Redirect based on user type
    navigate(userType === 'business' ? '/dashboard' : '/businesses');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="register-page min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="register-container max-w-md w-full">
        <Card className="register-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join LoyaltyPlus</CardTitle>
            <p className="text-gray-600">Create your account to get started</p>
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
                <div className="form-group-name">
                  <Label htmlFor="name">
                    {userType === 'business' ? 'Business Name' : 'Full Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-name"
                    required
                  />
                </div>

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

                {userType === 'business' && (
                  <div className="form-group-business-type">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger className="select-business-type">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

                <div className="form-group-confirm-password">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="input-confirm-password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-register w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Create Account
                </Button>
              </form>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
