
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileFixer from '@/components/ProfileFixer';

const BusinessDirectory = () => {
  const { isAuthenticated, userRole } = useAppStore();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view the business directory.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileFixer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Business Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sample Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a sample business card. Real businesses will be loaded from the database.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDirectory;
