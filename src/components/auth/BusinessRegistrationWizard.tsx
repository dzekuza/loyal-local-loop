
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, ArrowRight } from 'lucide-react';

const BusinessRegistrationWizard = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    businessNiche: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2
    logo: null as File | null,
    coverImage: null as File | null,
    shortDescription: '',
    contactPhone: '',
  });

  const businessNiches = [
    'Restaurant', 'Cafe', 'Fast Food', 'Bar/Pub',
    'Beauty Salon', 'Spa', 'Barbershop', 'Nail Salon',
    'Retail Store', 'Clothing', 'Electronics', 'Bookstore',
    'Fitness Center', 'Yoga Studio', 'Gym', 'Sports Club',
    'Entertainment', 'Cinema', 'Gaming', 'Events',
    'Services', 'Auto Repair', 'Cleaning', 'Photography',
    'Health', 'Pharmacy', 'Dental', 'Medical',
    'Other'
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessNiche) {
      toast({
        title: "Error",
        description: "Please select a business niche",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        name: formData.businessName,
        user_role: 'business',
        business_type: formData.businessNiche,
        description: formData.shortDescription,
        phone: formData.contactPhone,
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
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleFileUpload = (type: 'logo' | 'coverImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Create Business Account
              </CardTitle>
              <p className="text-gray-600">
                Step {currentStep} of 2: {currentStep === 1 ? 'Business Information' : 'Business Details'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {currentStep === 1 ? (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessNiche">Business Niche</Label>
                    <Select value={formData.businessNiche} onValueChange={(value) => setFormData({ ...formData, businessNiche: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessNiches.map((niche) => (
                          <SelectItem key={niche} value={niche}>
                            {niche}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Business Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Business Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('logo')}
                        className="hidden"
                      />
                      <Label htmlFor="logo" className="cursor-pointer text-sm text-purple-600 hover:text-purple-800">
                        {formData.logo ? formData.logo.name : 'Click to upload logo'}
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <Input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload('coverImage')}
                        className="hidden"
                      />
                      <Label htmlFor="coverImage" className="cursor-pointer text-sm text-purple-600 hover:text-purple-800">
                        {formData.coverImage ? formData.coverImage.name : 'Click to upload cover image'}
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Briefly describe your business..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              )}

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

export default BusinessRegistrationWizard;
