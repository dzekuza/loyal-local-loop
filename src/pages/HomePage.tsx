
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Store, Users, Smartphone, QrCode, Gift, Award } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAppStore();

  const features = [
    {
      icon: <Store className="w-8 h-8" />,
      title: "Business Management",
      description: "Create your business profile and manage your loyalty program"
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Integration",
      description: "Generate unique QR codes for seamless point collection"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Apple Wallet Cards",
      description: "Customers get digital loyalty cards in their Apple Wallet"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Custom Rewards",
      description: "Set your own spending rules and reward thresholds"
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(userRole === 'business' ? '/dashboard' : '/businesses');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="homepage-container min-h-screen">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Modernize Your<br />
            <span className="text-yellow-300">Loyalty Program</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Help local businesses create digital loyalty programs with QR codes and Apple Wallet integration
          </p>
          <div className="hero-actions flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="btn-hero-primary bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Your Program'}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/businesses')}
              className="btn-hero-secondary border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg"
            >
              Browse Businesses
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="features-title text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="features-subtitle text-xl text-gray-600 max-w-2xl mx-auto">
              Simple tools to create, manage, and grow your customer loyalty program
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="feature-icon w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title font-semibold text-lg text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="feature-description text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="stat-label text-gray-600">Digital Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold text-purple-600 mb-2">Easy</div>
              <div className="stat-label text-gray-600">Setup Process</div>
            </div>
            <div className="stat-item">
              <div className="stat-number text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="stat-label text-gray-600">Customer Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="cta-title text-3xl md:text-4xl font-bold mb-4">
            Ready to Launch Your Loyalty Program?
          </h2>
          <p className="cta-subtitle text-xl mb-8 text-blue-100">
            Join businesses already using LoyaltyPlus to grow customer retention
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="btn-cta bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
