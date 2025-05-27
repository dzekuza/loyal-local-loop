
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import QRGenerator from '../../components/business/QRGenerator';
import OfferForm from '../../components/offers/OfferForm';
import { Store, Users, Gift, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    userRole, 
    currentUser, 
    currentBusiness, 
    setCurrentBusiness 
  } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'business') {
      navigate('/login');
      return;
    }

    loadBusinessProfile();
  }, [isAuthenticated, userRole, user]);

  const loadBusinessProfile = async () => {
    if (!user) return;

    try {
      // Check if business profile exists
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (business) {
        setCurrentBusiness({
          id: business.id,
          name: business.name,
          email: business.email,
          logo: business.logo,
          businessType: business.business_type,
          description: business.description,
          qrCode: business.qr_code,
          createdAt: new Date(business.created_at),
        });
      } else {
        // Create business profile if it doesn't exist
        await createBusinessProfile();
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
      toast({
        title: "Error",
        description: "Failed to load business profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBusinessProfile = async () => {
    if (!user || !currentUser) return;

    try {
      const businessData = {
        user_id: user.id,
        name: currentUser.name,
        email: user.email,
        business_type: currentUser.businessType || 'Restaurant',
        description: `Welcome to ${currentUser.name}! We offer great products and services.`,
        qr_code: `qr_${user.id}`,
      };

      const { data: business, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) throw error;

      setCurrentBusiness({
        id: business.id,
        name: business.name,
        email: business.email,
        logo: business.logo,
        businessType: business.business_type,
        description: business.description,
        qrCode: business.qr_code,
        createdAt: new Date(business.created_at),
      });

      toast({
        title: "Business Profile Created",
        description: "Your business profile has been set up successfully!",
      });
    } catch (error) {
      console.error('Error creating business profile:', error);
      toast({
        title: "Error",
        description: "Failed to create business profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your business dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="dashboard-error min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load business profile. Please try again.</p>
          <Button onClick={loadBusinessProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: '0',
      icon: <Users className="w-5 h-5" />,
      change: 'New'
    },
    {
      title: 'Active Offers',
      value: '0',
      icon: <Gift className="w-5 h-5" />,
      change: 'Create one'
    },
    {
      title: 'Points Distributed',
      value: '0',
      icon: <TrendingUp className="w-5 h-5" />,
      change: 'Start earning'
    }
  ];

  return (
    <div className="dashboard-container min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="dashboard-header mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="business-avatar w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentBusiness.name}</h1>
              <p className="text-gray-600">{currentBusiness.businessType}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="stat-icon w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="dashboard-content grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="qr-section">
            <QRGenerator 
              businessId={currentBusiness.id}
              businessName={currentBusiness.name}
            />
          </div>

          <div className="offer-section">
            <OfferForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
