
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface OfferFormProps {
  onOfferCreated?: () => void;
}

const OfferForm = ({ onOfferCreated }: OfferFormProps) => {
  const { user } = useAuth();
  const { currentBusiness } = useAppStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reward_description: '',
    spend_amount: '',
    points_earned: '',
    reward_threshold: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness || !user) {
      toast({
        title: "Error",
        description: "Business profile or user authentication missing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating offer with data:', {
        business_id: currentBusiness.id,
        reward_description: formData.reward_description,
        spend_amount: parseInt(formData.spend_amount),
        points_earned: parseInt(formData.points_earned),
        reward_threshold: parseInt(formData.reward_threshold),
        is_active: true
      });

      const { data, error } = await supabase
        .from('loyalty_offers')
        .insert({
          business_id: currentBusiness.id,
          reward_description: formData.reward_description,
          spend_amount: parseInt(formData.spend_amount),
          points_earned: parseInt(formData.points_earned),
          reward_threshold: parseInt(formData.reward_threshold),
          is_active: true
        })
        .select()
        .single();

      console.log('Offer creation result:', { data, error });

      if (error) {
        console.error('Error creating offer:', error);
        toast({
          title: "Database Error",
          description: `Failed to create offer: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Offer Created",
        description: "Your loyalty offer has been created successfully!",
      });

      setFormData({
        reward_description: '',
        spend_amount: '',
        points_earned: '',
        reward_threshold: ''
      });

      onOfferCreated?.();
    } catch (error) {
      console.error('Unexpected error creating offer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Unexpected error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reward_description">Reward Description</Label>
            <Textarea
              id="reward_description"
              value={formData.reward_description}
              onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
              placeholder="e.g., Free coffee on your 10th visit"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spend_amount">Spend Amount ($)</Label>
              <Input
                id="spend_amount"
                type="number"
                value={formData.spend_amount}
                onChange={(e) => setFormData({ ...formData, spend_amount: e.target.value })}
                placeholder="10"
                required
              />
            </div>

            <div>
              <Label htmlFor="points_earned">Points Earned</Label>
              <Input
                id="points_earned"
                type="number"
                value={formData.points_earned}
                onChange={(e) => setFormData({ ...formData, points_earned: e.target.value })}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reward_threshold">Points Required for Reward</Label>
            <Input
              id="reward_threshold"
              type="number"
              value={formData.reward_threshold}
              onChange={(e) => setFormData({ ...formData, reward_threshold: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferForm;
