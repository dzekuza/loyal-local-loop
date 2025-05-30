
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Star, CheckCircle, Loader2 } from 'lucide-react';

interface CustomerLoyaltyCardProps {
  business: {
    id: string;
    name: string;
    description?: string;
    businessType?: string;
  };
  onJoinSuccess?: () => void;
}

const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({ business, onJoinSuccess }) => {
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    checkMembership();
  }, [business.id, user]);

  const checkMembership = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('customer_id', user.id)
        .eq('business_id', business.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking membership:', error);
        return;
      }

      setHasJoined(!!data);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleJoinProgram = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to join the loyalty program",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      // Create user_points record
      const { error: pointsError } = await supabase
        .from('user_points')
        .insert({
          customer_id: user.id,
          business_id: business.id,
          total_points: 0
        });

      if (pointsError && pointsError.code !== '23505') { // 23505 is duplicate key error
        console.error('Error creating user_points:', pointsError);
        throw new Error(`Failed to join loyalty program: ${pointsError.message}`);
      }

      setHasJoined(true);
      toast({
        title: "Welcome! 🎉",
        description: `You've successfully joined ${business.name}'s loyalty program!`,
      });

      onJoinSuccess?.();
    } catch (error) {
      console.error('Error joining program:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join loyalty program",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Loyalty Program</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Sign in to join {business.name}'s loyalty program and start earning rewards!
          </p>
          <Button disabled className="w-full">
            Sign In to Join
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Loyalty Program</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasJoined ? (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-600 font-medium">You're a member!</span>
            </div>
            <p className="text-gray-600 mb-4">
              You're part of {business.name}'s loyalty program. Start earning points with every purchase!
            </p>
            <div className="flex items-center justify-center space-x-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <span className="text-gray-600 ml-2">Member since today</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Join {business.name}'s loyalty program to earn points and unlock exclusive rewards!
            </p>
            <Button
              onClick={handleJoinProgram}
              disabled={joining}
              className="w-full"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Join Loyalty Program
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerLoyaltyCard;
