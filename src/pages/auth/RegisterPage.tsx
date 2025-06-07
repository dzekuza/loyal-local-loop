
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store } from 'lucide-react';
import BusinessRegistrationWizard from '@/components/auth/BusinessRegistrationWizard';
import CustomerRegistrationForm from '@/components/auth/CustomerRegistrationForm';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const [accountType, setAccountType] = useState<'customer' | 'business' | null>(null);
  const { t } = useTranslation();

  if (accountType === 'business') {
    return <BusinessRegistrationWizard />;
  }

  if (accountType === 'customer') {
    return <CustomerRegistrationForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{t('auth.chooseAccountType')}</CardTitle>
              <p className="text-gray-600">{t('auth.selectHowToUse')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setAccountType('customer')}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-semibold">{t('auth.customer')}</div>
                  <div className="text-sm text-gray-500">{t('auth.customerDescription')}</div>
                </div>
              </Button>

              <Button
                onClick={() => setAccountType('business')}
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Store className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-semibold">{t('auth.business')}</div>
                  <div className="text-sm text-gray-500">{t('auth.businessDescription')}</div>
                </div>
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link to="/login" className="text-purple-600 hover:underline">
                    {t('auth.signInHere')}
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

export default RegisterPage;
