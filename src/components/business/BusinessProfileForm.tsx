
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Business } from '@/types';
import { Building2 } from 'lucide-react';

const businessFormSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  business_type: z.string().min(1, 'Business type is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),
});

interface BusinessProfileFormProps {
  business: Business;
  onUpdate: (business: Business) => void;
}

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({ business, onUpdate }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [rewardsCount, setRewardsCount] = useState(0);

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: business.name,
      description: business.description,
      business_type: business.businessType,
      contact_email: business.email,
      contact_phone: business.phone || '',
      contact_address: business.address || '',
    },
  });

  React.useEffect(() => {
    loadRewardsCount();
  }, [business.id]);

  const loadRewardsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('customer_id')
        .eq('business_id', business.id)
        .gte('points_earned', 1);

      if (error) throw error;

      // Count unique customers who got rewards
      const uniqueCustomers = new Set(data?.map(t => t.customer_id));
      setRewardsCount(uniqueCustomers.size);
    } catch (error) {
      console.error('Error loading rewards count:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${business.id}/${type}-${Date.now()}.${fileExt}`;

      console.log(`Uploading ${type} file:`, fileName);

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(fileName);

      console.log(`${type} uploaded successfully:`, publicUrl);
      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof businessFormSchema>) => {
    setIsLoading(true);
    try {
      let logoUrl = business.logo;
      let coverUrl = business.coverImage;

      // Upload logo if selected
      if (logoFile) {
        console.log('Uploading logo file...');
        logoUrl = await handleFileUpload(logoFile, 'logo');
      }

      // Upload cover image if selected
      if (coverFile) {
        console.log('Uploading cover file...');
        coverUrl = await handleFileUpload(coverFile, 'cover');
      }

      // Update business in database
      const updateData = {
        name: values.name,
        description: values.description,
        business_type: values.business_type,
        email: values.contact_email,
        phone: values.contact_phone || null,
        address: values.contact_address || null,
        logo: logoUrl,
        cover_image: coverUrl,
      };

      console.log('Updating business with data:', updateData);

      const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Business updated successfully:', data);

      const updatedBusiness: Business = {
        id: data.id,
        name: data.name,
        email: data.email,
        logo: data.logo,
        coverImage: data.cover_image,
        address: data.address,
        phone: data.phone,
        businessType: data.business_type,
        description: data.description,
        qrCode: data.qr_code,
        createdAt: new Date(data.created_at),
      };

      onUpdate(updatedBusiness);

      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });

      // Clear file inputs
      setLogoFile(null);
      setCoverFile(null);
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update business profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Edit Business Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Business Logo</Label>
              <div className="flex items-center space-x-4">
                {business.logo && (
                  <img src={business.logo} alt="Current logo" className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-auto"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a new logo (optional)</p>
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center space-x-4">
                {business.coverImage && (
                  <img src={business.coverImage} alt="Current cover" className="w-24 h-16 object-cover rounded-lg" />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-auto"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a cover image (optional)</p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Restaurant, Retail, Service" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rewards Statistics */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Rewards Statistics</h3>
              <p className="text-purple-700">
                {rewardsCount} customers have received rewards from your business
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileForm;
