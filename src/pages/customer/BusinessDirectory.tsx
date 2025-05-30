
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BusinessCard from '@/components/business/BusinessCard';
import { Search, Store } from 'lucide-react';
import { Business } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = businesses.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  const fetchBusinesses = async () => {
    console.log('Fetching businesses...');
    try {
      setError(null);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Businesses data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const mappedBusinesses: Business[] = (data || []).map(business => ({
        id: business.id,
        name: business.name,
        email: business.email,
        logo: business.logo,
        businessType: business.business_type,
        description: business.description || '',
        qrCode: business.qr_code,
        createdAt: new Date(business.created_at),
      }));

      console.log('Mapped businesses:', mappedBusinesses);
      setBusinesses(mappedBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError(error instanceof Error ? error.message : 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading businesses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <Store className="w-16 h-16 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Businesses
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchBusinesses} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const businessTypes = [...new Set(businesses.map(b => b.businessType))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-4">
          <Button onClick={() => navigate('/scan')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            Scan QR Code
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Business Directory
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover local businesses and their loyalty programs. Earn points, get rewards, and support your community.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {businessTypes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {businessTypes.map(type => (
                    <Badge key={type} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredBusinesses.length} Business{filteredBusinesses.length !== 1 ? 'es' : ''} Found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Store className="w-4 h-4" />
              <span>All verified businesses</span>
            </div>
          </div>
        </div>

        {/* Business Grid */}
        {filteredBusinesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No businesses found' : 'No businesses yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to register your business or check back later!'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/register')} className="mt-2">
                  Register Your Business
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
