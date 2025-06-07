
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Building2, Mail, User } from 'lucide-react';
import { ComingSoonBusiness } from '@/types/comingSoon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessClaimModalProps {
  business: ComingSoonBusiness;
  isOpen: boolean;
  onClose: () => void;
}

const BusinessClaimModal: React.FC<BusinessClaimModalProps> = ({ 
  business, 
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert claim into database
      const { data, error } = await supabase
        .from('business_claims')
        .insert({
          coming_soon_business_id: business.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          message: formData.message || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting claim:', error);
        throw error;
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-business-claim', {
        body: {
          business: business,
          claimant: formData,
          claimId: data.id
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the entire process if email fails
      }

      toast({
        title: "Claim Submitted!",
        description: "Your business claim has been submitted successfully. We'll review it and get back to you soon.",
      });

      // Reset form and close modal
      setFormData({ email: '', firstName: '', lastName: '', message: '' });
      onClose();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Claim Business</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-900">{business.business_name}</h4>
          <p className="text-xs text-gray-600">{business.business_type}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>Email Address *</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>First Name *</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us about your business or why you should own this listing..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Claim this business'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessClaimModal;
