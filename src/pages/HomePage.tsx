
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { Testimonials } from '../components/ui/testimonials';
import { FeaturesSectionWithHoverEffects } from '../components/ui/feature-section-with-hover-effects';
import { Store, Smartphone, QrCode, Gift, Award, CheckCircle, ArrowRight, Users, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAppStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(userRole === 'business' ? '/dashboard' : '/businesses');
    } else {
      navigate('/register');
    }
  };

  const handleBusinessSignup = () => {
    navigate('/register');
  };

  const testimonials = [
    {
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: "I love how I can track my loyalty points at all my favorite cafes in one place!",
      name: 'Sarah Chen',
      username: '@sarahchen',
      social: 'https://twitter.com/sarahchen'
    },
    {
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: 'No more carrying around a dozen loyalty cards. Everything is in my phone now.',
      name: 'Mike Rodriguez',
      username: '@mikerodriguez',
      social: 'https://twitter.com/mikerodriguez'
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: 'The rewards I get are actually worth it. Great experience overall!',
      name: 'Emma Davis',
      username: '@emmadavis',
      social: 'https://twitter.com/emmadavis'
    },
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: 'Using this loyalty platform has significantly improved my shopping experience. The digital cards are so convenient!',
      name: 'James Wilson',
      username: '@jameswilson',
      social: 'https://twitter.com/jameswilson'
    },
    {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: 'The QR code scanning is instant and the rewards are great. Highly recommend!',
      name: 'Sophia Lee',
      username: '@sophialee',
      social: 'https://twitter.com/sophialee'
    },
    {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      text: 'Finally, a loyalty program that actually works well. Love the Apple Wallet integration.',
      name: 'Michael Davis',
      username: '@michaeldavis',
      social: 'https://twitter.com/michaeldavis'
    }
  ];

  const businessFeatures = [
    "Increase customer retention by 25%",
    "Easy QR code setup in minutes", 
    "Real-time analytics dashboard",
    "Apple Wallet integration included"
  ];

  return (
    <div className="homepage-container min-h-screen">
      {/* Hero Section */}
      <HeroGeometric 
        badge="Loyalty Rewards Platform"
        title1="Your loyalty cards,"
        title2="simplified."
      />

      {/* Features Section */}
      <section className="features-section py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to earn more
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful tools to help you get the most out of your local shopping experience.
            </p>
          </div>

          <FeaturesSectionWithHoverEffects />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <Testimonials 
            testimonials={testimonials}
            title="Loved by customers everywhere"
            description="See what people are saying about their loyalty rewards experience"
            maxDisplayed={3}
          />
        </div>
      </section>

      {/* Business CTA Section */}
      <section className="business-cta-section py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-8 h-8 mr-3" />
              <Badge variant="outline" className="border-white/20 text-white bg-white/10">
                For Business Owners
              </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Own a business?
              <span className="text-yellow-300 block">Join now.</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Create a modern loyalty program that your customers will love. Increase retention, boost sales, and build lasting relationships.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {businessFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-center md:justify-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleBusinessSignup}
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Start Your Program
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start earning rewards?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of customers who are already earning points and unlocking rewards.
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
