
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileFixer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createMissingProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No authenticated user found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating missing profile for user:', user.id);
      
      const profileData = {
        id: user.id,
        name: user.email || 'Unknown User',
        user_role: 'customer',
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Error",
          description: `Failed to create profile: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Successfully created profile:', data);
        toast({
          title: "Success",
          description: "Profile created successfully! Please refresh the page.",
        });
      }
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Profile Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          It looks like your profile is missing from the database. Click the button below to create it.
        </p>
        <Button 
          onClick={createMissingProfile} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileFixer;
