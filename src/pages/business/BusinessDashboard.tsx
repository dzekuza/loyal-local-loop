
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import QRGenerator from '../../components/business/QRGenerator';
import OfferForm from '../../components/offers/OfferForm';
import { Store, Users, Gift, TrendingUp } from 'lucide-react';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    userRole, 
    currentUser, 
    currentBusiness, 
    setCurrentBusiness,
    addBusiness 
  } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'business') {
      navigate('/login');
      return;
    }

    // Create or load business profile
    if (!currentBusiness && currentUser) {
      const business = {
        id: `business_${currentUser.id}`,
        name: currentUser.name,
        email: currentUser.email,
        businessType: currentUser.businessType || 'Restaurant',
        description: `Welcome to ${currentUser.name}! We offer great products and services.`,
        qrCode: `qr_${currentUser.id}`,
        createdAt: new Date(),
      };
      
      addBusiness(business);
      setCurrentBusiness(business);
    }
  }, [isAuthenticated, userRole, currentUser, currentBusiness]);

  if (!currentBusiness) {
    return (
      <div className="dashboard-loading min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your business dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: '24',
      icon: <Users className="w-5 h-5" />,
      change: '+12%'
    },
    {
      title: 'Active Offers',
      value: '1',
      icon: <Gift className="w-5 h-5" />,
      change: 'New'
    },
    {
      title: 'Points Distributed',
      value: '1,240',
      icon: <TrendingUp className="w-5 h-5" />,
      change: '+8%'
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
          
          <Button 
            onClick={() => navigate('/profile')}
            variant="outline"
            className="btn-edit-profile"
          >
            Edit Profile
          </Button>
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
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="dashboard-content grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="qr-section">
            <QRGenerator 
              businessId={currentBusiness.id}
              businessName={currentBusiness.name}
            />
          </div>

          {/* Offer Form Section */}
          <div className="offer-section">
            <OfferForm />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  variant="outline"
                  className="btn-view-analytics"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outline"
                  className="btn-manage-customers"
                  onClick={() => navigate('/customers')}
                >
                  Manage Customers
                </Button>
                <Button 
                  variant="outline"
                  className="btn-download-qr"
                  onClick={() => {/* Handle QR download */}}
                >
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
