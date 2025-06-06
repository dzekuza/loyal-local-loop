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
import { Store, Users, Gift, TrendingUp, Scan, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🏢 BusinessDashboard: checking auth state', { 
      isAuthenticated, 
      userRole, 
      user: !!user,
      authLoading 
    });
    
    if (authLoading) {
      console.log('⏳ Still loading auth...');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (userRole !== 'business') {
      console.log('❌ Not a business user, current role:', userRole);
      toast({
        title: "Access Denied",
        description: "You need a business account to access the dashboard. Please contact support if you believe this is an error.",
        variant: "destructive",
      });
      navigate('/businesses');
      return;
    }

    // User is authenticated and has business role
    loadBusinessProfile();
  }, [isAuthenticated, userRole, user, authLoading]);

  const loadBusinessProfile = async () => {
    if (!user) {
      console.log('❌ No user found');
      setError('No user session found');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading business profile for user:', user.id);
      setError(null);
      
      // Check if business profile exists
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📊 Business query result:', { business, error });

      if (error) {
        console.error('❌ Error fetching business:', error);
        setError(`Failed to load business profile: ${error.message}`);
        setLoading(false);
        return;
      }

      if (business) {
        console.log('✅ Business found:', business.name);
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
          title: "Welcome back!",
          description: `${business.name} dashboard loaded successfully`,
        });
      } else {
        console.log('⚠️ No business found, creating one');
        await createBusinessProfile();
      }
    } catch (error) {
      console.error('❌ Error loading business profile:', error);
      setError(`Failed to load business profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log('❌ Missing user or currentUser data');
      setError('Missing user information');
      return;
    }

    try {
      const businessData = {
        user_id: user.id,
        name: currentUser.name || user.email || 'My Business',
        email: user.email,
        business_type: currentUser.businessType || 'Restaurant',
        description: `Welcome to ${currentUser.name || 'our business'}! We offer great products and services.`,
        qr_code: `qr_${user.id}`,
      };

      console.log('🆕 Creating business with data:', businessData);

      const { data: business, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating business:', error);
        setError(`Failed to create business profile: ${error.message}`);
        return;
      }

      console.log('✅ Business created successfully:', business);

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
        title: "Business Profile Created! 🎉",
        description: "Your business profile has been set up successfully!",
      });
    } catch (error) {
      console.error('❌ Error creating business profile:', error);
      setError(`Failed to create business profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadBusinessProfile();
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="dashboard-loading min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : 'Setting up your business dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard-error min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleRetry}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/business-profile')}>
              Set Up Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show message if no business profile
  if (!currentBusiness) {
    return (
      <div className="dashboard-error min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <Store className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Profile Found</h3>
          <p className="text-gray-600 mb-4">We couldn't find your business profile. Let's create one.</p>
          <div className="space-x-2">
            <Button onClick={createBusinessProfile}>
              Create Business Profile
            </Button>
            <Button variant="outline" onClick={() => navigate('/business-profile')}>
              Manual Setup
            </Button>
          </div>
        </Card>
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

        {/* Single Prominent Scan Action */}
        <div className="scan-action mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Award Loyalty Points</h3>
                  <p className="text-green-100">Scan customer QR codes or enter customer codes manually</p>
                </div>
                <Button
                  onClick={() => {
                    console.log('🎯 Navigating to scan page with business:', currentBusiness.id);
                    navigate('/business/scan');
                  }}
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold"
                  size="lg"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Start Scanning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
