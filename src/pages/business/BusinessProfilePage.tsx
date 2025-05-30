
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import BusinessProfileForm from '@/components/business/BusinessProfileForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated, userRole, currentBusiness, setCurrentBusiness } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'business') {
      navigate('/login');
      return;
    }

    if (!currentBusiness) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, userRole, currentBusiness, navigate]);

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <BusinessProfileForm 
          business={currentBusiness}
          onUpdate={setCurrentBusiness}
        />
      </div>
    </div>
  );
};

export default BusinessProfilePage;
