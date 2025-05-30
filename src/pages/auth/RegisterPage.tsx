import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Store, Users } from 'lucide-react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: 'customer',
    businessType: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const userData = {
      name: formData.name,
      user_role: formData.userRole,
      business_type: formData.businessType,
    };

    const { error } = await signUp(formData.email, formData.password, userData);

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      navigate('/login');
    }

    setLoading(false);
  };

  const businessTypes = [
    'Restaurant', 'Cafe', 'Retail Store', 'Beauty Salon', 
    'Fitness Center', 'Bookstore', 'Pharmacy', 'Other'
  ];

  return (
    <div className="register-page min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Add connection test component for debugging */}
          <div className="mb-8">
            <SupabaseConnectionTest />
          </div>
          
          <Card className="register-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <p className="text-gray-600">Join our loyalty program network</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-name"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input-email"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="userRole">Account Type</Label>
                  <Select value={formData.userRole} onValueChange={(value) => setFormData({ ...formData, userRole: value })}>
                    <SelectTrigger className="select-user-role">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center space-x-2">
                          <Users size={16} />
                          <span>Customer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="business">
                        <div className="flex items-center space-x-2">
                          <Store size={16} />
                          <span>Business Owner</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.userRole === 'business' && (
                  <div className="form-group">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
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

                <div className="form-group">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="input-password"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="input-confirm-password"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="btn-register w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-600 hover:underline">
                    Sign in here
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

export default RegisterPage;
