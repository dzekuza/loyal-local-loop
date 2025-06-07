
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useBusinesses } from '../hooks/useBusinesses';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import BusinessPreviewCard from '../components/business/BusinessPreviewCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAppStore();
  const { data: businesses, isLoading } = useBusinesses();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(userRole === 'business' ? '/dashboard' : '/businesses');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="homepage-container min-h-screen overflow-x-hidden bg-gray-50">
      {/* Hero Section with Airbnb styling */}
      <section className="relative bg-gradient-to-br from-white via-gray-50 to-red-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5" />
        <div className="container-airbnb section-spacing relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 bg-red-100 text-red-800 border-red-200 font-medium rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('home.hero.badge')}
            </Badge>
            
            <h1 className="heading-airbnb text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6">
              {t('home.hero.title1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                {' '}{t('home.hero.title2')}
              </span>
            </h1>
            
            <p className="subheading-airbnb text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto">
              {t('home.connectWithLocal')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="xl"
                variant="airbnb"
                onClick={handleGetStarted}
                className="w-full sm:w-auto"
              >
                {t('home.getStartedToday')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="xl"
                variant="airbnbOutline"
                onClick={() => navigate('/discover')}
                className="w-full sm:w-auto"
              >
                {t('home.exploreBusinesses')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Cards Section */}
      <section className="section-spacing bg-white">
        <div className="container-airbnb">
          <div className="text-center mb-16">
            <h2 className="heading-airbnb text-3xl md:text-4xl lg:text-5xl mb-6">
              {t('home.explore.title')}
            </h2>
            <p className="subheading-airbnb text-lg md:text-xl max-w-2xl mx-auto">
              {t('home.explore.subtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="airbnb-subtle" className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : businesses && businesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {businesses.slice(0, 8).map((business) => (
                <div key={business.id} className="animate-fade-in-up">
                  <BusinessPreviewCard business={business} />
                </div>
              ))}
            </div>
          ) : (
            <Card variant="airbnb-subtle" className="text-center py-16">
              <CardContent>
                <p className="text-gray-600 mb-6 text-lg">{t('home.noBusinessesFound')}</p>
                <Button variant="airbnb" onClick={() => navigate('/businesses')}>
                  {t('home.exploreBusinesses')}
                </Button>
              </CardContent>
            </Card>
          )}

          {businesses && businesses.length > 8 && (
            <div className="text-center mt-12">
              <Button 
                variant="airbnbSecondary"
                size="lg"
                onClick={() => navigate('/businesses')}
              >
                {t('home.viewAllBusinesses')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing bg-white">
        <div className="container-airbnb text-center max-w-4xl">
          <h2 className="heading-airbnb text-3xl md:text-4xl mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="subheading-airbnb text-lg mb-10 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Button 
            size="xl"
            variant="airbnb"
            onClick={handleGetStarted}
            className="w-full sm:w-auto"
          >
            {t('home.cta.button')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
