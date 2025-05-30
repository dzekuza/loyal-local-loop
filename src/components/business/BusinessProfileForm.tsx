
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
import { Upload, Camera, Building2 } from 'lucide-react';

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
      contact_phone: '',
      contact_address: '',
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${business.id}/${type}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('business-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (values: z.infer<typeof businessFormSchema>) => {
    setIsLoading(true);
    try {
      let logoUrl = business.logo;
      let coverUrl = '';

      if (logoFile) {
        logoUrl = await handleFileUpload(logoFile, 'logo');
      }

      if (coverFile) {
        coverUrl = await handleFileUpload(coverFile, 'cover');
      }

      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: values.name,
          description: values.description,
          business_type: values.business_type,
          email: values.contact_email,
          logo: logoUrl,
          // Add cover_image field if it exists in your schema
        })
        .eq('id', business.id)
        .select()
        .single();

      if (error) throw error;

      const updatedBusiness: Business = {
        id: data.id,
        name: data.name,
        email: data.email,
        logo: data.logo,
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
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: "Failed to update business profile",
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
