
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import BusinessCard from '../../components/business/BusinessCard';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Business } from '../../types';

const BusinessDirectory = () => {
  const { businesses, setBusinesses } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  // Sample business data for demo
  useEffect(() => {
    if (businesses.length === 0) {
      const sampleBusinesses: Business[] = [
        {
          id: 'business_1',
          name: 'Café Delight',
          email: 'info@cafedelight.com',
          businessType: 'Cafe',
          description: 'Artisan coffee and fresh pastries in the heart of the city. Join our loyalty program and earn points with every purchase!',
          qrCode: 'qr_business_1',
          createdAt: new Date(),
        },
        {
          id: 'business_2',
          name: 'Fresh Fitness Studio',
          email: 'hello@freshfitness.com',
          businessType: 'Fitness Center',
          description: 'Modern fitness studio with state-of-the-art equipment. Get rewarded for staying healthy with our points system.',
          qrCode: 'qr_business_2',
          createdAt: new Date(),
        },
        {
          id: 'business_3',
          name: 'BookWorm Corner',
          email: 'books@bookwormcorner.com',
          businessType: 'Bookstore',
          description: 'Independent bookstore featuring local authors and rare finds. Every book purchase earns you loyalty points.',
          qrCode: 'qr_business_3',
          createdAt: new Date(),
        },
        {
          id: 'business_4',
          name: 'Bella Vista Restaurant',
          email: 'dining@bellavista.com',
          businessType: 'Restaurant',
          description: 'Authentic Italian cuisine with a modern twist. Dine with us and collect points for exclusive rewards.',
          qrCode: 'qr_business_4',
          createdAt: new Date(),
        }
      ];
      
      setBusinesses(sampleBusinesses);
    }
  }, [businesses.length, setBusinesses]);

  // Filter businesses based on search and type
  useEffect(() => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(business => business.businessType === selectedType);
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, selectedType]);

  const businessTypes = ['all', 'Restaurant', 'Cafe', 'Retail Store', 'Beauty Salon', 'Fitness Center', 'Bookstore', 'Pharmacy'];

  return (
    <div className="business-directory min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="directory-header text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Local Businesses
          </h1>
          <p className="text-lg text-gray-600">
            Find businesses with loyalty programs and start earning rewards
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="search-input relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-search"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="select-business-type">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count mb-6">
          <p className="text-gray-600 text-center">
            Showing {filteredBusinesses.length} businesses
            {searchTerm && ` for "${searchTerm}"`}
            {selectedType !== 'all' && ` in ${selectedType}`}
          </p>
        </div>

        {/* Business Grid */}
        <div className="businesses-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
