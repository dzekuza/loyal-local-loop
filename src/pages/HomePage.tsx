
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Store, Smartphone, QrCode, Gift, Award, Star, CheckCircle, ArrowRight, Users, TrendingUp } from 'lucide-react';

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

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Digital Loyalty Cards",
      description: "Store all your loyalty cards in Apple Wallet - no more plastic cards to lose"
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Quick QR Scanning",
      description: "Earn points instantly by scanning QR codes at participating businesses"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Exclusive Rewards",
      description: "Unlock special offers and rewards based on your loyalty level"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Track Progress",
      description: "See your points, achievements, and progress toward your next reward"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Coffee Enthusiast",
      content: "I love how I can track my loyalty points at all my favorite cafes in one place!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Local Shopper",
      content: "No more carrying around a dozen loyalty cards. Everything's in my phone now.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Restaurant Regular",
      content: "The rewards I get are actually worth it. Great experience overall!",
      rating: 5
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
      <section className="hero-section relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Join 10,000+ happy customers
            </Badge>
            
            <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Your loyalty cards,
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent block">
                simplified.
              </span>
            </h1>
            
            <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover local businesses, earn points effortlessly, and unlock rewards - all from your phone.
            </p>
            
            <div className="hero-actions flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Earning Rewards
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/businesses')}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              >
                Browse Local Businesses
              </Button>
            </div>

            {/* Hero Visual */}
            <div className="relative max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Coffee Corner</h3>
                      <p className="text-sm text-gray-500">Local Cafe</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <Gift className="w-3 h-3 mr-1" />
                    Reward Ready
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Points</span>
                    <span className="font-bold text-2xl text-purple-600">850</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>150 points to next reward</span>
                    <span>Free Coffee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-purple-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by customers everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what people are saying about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
