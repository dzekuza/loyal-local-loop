import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useBusinessAnalytics } from '@/hooks/useBusinessAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import QRGenerator from '../../components/business/QRGenerator';
import OfferForm from '../../components/offers/OfferForm';
import OffersList from '../../components/offers/OffersList';
import PointCollection from '../../components/business/PointCollection';
import { Store, Users, Gift, TrendingUp, Scan, Smartphone, ArrowRight } from 'lucide-react';
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
  const { analytics, loading: analyticsLoading } = useBusinessAnalytics();
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('Dashboard: checking auth state', { isAuthenticated, userRole, user });
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (userRole !== 'business') {
      console.log('Not a business user, redirecting to businesses page');
      toast({
        title: "Access Denied",
        description: "You need a business account to access the dashboard",
        variant: "destructive",
      });
      navigate('/businesses');
      return;
    }

    loadBusinessProfile();
  }, [isAuthenticated, userRole, user]);

  const loadBusinessProfile = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Loading business profile for user:', user.id);
      
      // Check if business profile exists
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business:', error);
        throw error;
      }

      if (business) {
        console.log('Business found:', business);
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
        console.log('No business found, creating one');
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
    if (!user || !currentUser) {
      console.log('Missing user or currentUser data');
      return;
    }

    try {
      const businessData = {
        user_id: user.id,
        name: currentUser.name,
        email: user.email,
        business_type: currentUser.businessType || 'Restaurant',
        description: `Welcome to ${currentUser.name}! We offer great products and services.`,
        qr_code: `qr_${user.id}`,
      };

      console.log('Creating business with data:', businessData);

      const { data: business, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        throw error;
      }

      console.log('Business created successfully:', business);

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

  const handleOfferCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePointsAwarded = () => {
    setRefreshKey(prev => prev + 1);
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
          <p className="text-gray-600 mb-4">Unable to load business profile.</p>
          <Button onClick={loadBusinessProfile}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: analyticsLoading ? '...' : analytics.totalCustomers.toString(),
      icon: <Users className="w-5 h-5" />,
      change: analytics.totalCustomers > 0 ? '+' + analytics.totalCustomers : 'No customers yet'
    },
    {
      title: 'Active Offers',
      value: analyticsLoading ? '...' : analytics.activeOffers.toString(),
      icon: <Gift className="w-5 h-5" />,
      change: analytics.activeOffers > 0 ? 'Live offers' : 'Create your first offer'
    },
    {
      title: 'Points Distributed',
      value: analyticsLoading ? '...' : analytics.totalPointsDistributed.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      change: analytics.totalPointsDistributed > 0 ? 'Total earned' : 'Start earning points'
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

        {/* Quick Actions */}
        <div className="quick-actions mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to Award Points?</h3>
                  <p className="text-green-100">Use our dedicated scanning page for the best experience</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Smartphone className="w-12 h-12 text-green-100" />
                  <Button
                    onClick={() => navigate('/business/scan')}
                    className="bg-white text-green-600 hover:bg-green-50 font-semibold"
                    size="lg"
                  >
                    <Scan className="w-5 h-5 mr-2" />
                    Open Scanner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="dashboard-content space-y-8">
          {/* Point Collection - Featured at the top */}
          <div className="point-collection-section">
            <PointCollection 
              businessId={currentBusiness.id}
              businessName={currentBusiness.name}
              onScanSuccess={handlePointsAwarded}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="qr-section">
              <QRGenerator 
                businessId={currentBusiness.id}
                businessName={currentBusiness.name}
              />
            </div>

            <div className="offer-section">
              <OfferForm onOfferCreated={handleOfferCreated} />
            </div>
          </div>

          {/* Offers List */}
          <div className="offers-list-section">
            <OffersList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
