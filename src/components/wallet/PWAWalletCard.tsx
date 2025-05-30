
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Smartphone, Download, Bell, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletCard {
  id: string;
  business: {
    id: string;
    name: string;
    business_type: string;
    description: string;
    logo?: string;
  };
  points: number;
  lastActivity: string;
}

interface PWAWalletCardProps {
  cards: WalletCard[];
  customerId: string;
  customerName: string;
}

const PWAWalletCard: React.FC<PWAWalletCardProps> = ({ cards, customerId, customerName }) => {
  const { toast } = useToast();
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation Not Available",
        description: "PWA installation is not available on this device/browser.",
        variant: "destructive",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "App Installed! 📱",
        description: "Loyalty Wallet has been added to your home screen.",
      });
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled! 🔔",
          description: "You'll receive updates when you earn points.",
        });
        
        // Show sample notification
        new Notification('Loyalty Wallet', {
          body: 'You\'ll now receive point updates!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const totalPoints = cards.reduce((sum, card) => sum + card.points, 0);

  return (
    <div className="space-y-6">
      {/* PWA Installation Card */}
      <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-purple-600" />
            <span>Install Wallet App</span>
            <Badge variant="secondary" className="ml-2">Free</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'} - Works without internet!</span>
          </div>
          
          <p className="text-gray-600">
            Install our wallet app on your phone for easy access to all your loyalty cards. 
            Works offline and sends push notifications when you earn points!
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleInstallPWA}
              disabled={!isInstallable}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Install App' : 'Already Installed'}</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={enableNotifications}
              className="flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Notifications</span>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Works offline</p>
            <p>✓ Push notifications</p>
            <p>✓ Home screen access</p>
            <p>✓ Real-time point updates</p>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{totalPoints}</div>
            <div className="text-lg opacity-90">Total Points</div>
            <div className="text-sm opacity-75 mt-2">
              Across {cards.length} business{cards.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Card Preview */}
      <div className="grid grid-cols-2 gap-3">
        {cards.slice(0, 4).map(card => (
          <Card key={card.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{card.points}</div>
                <div className="text-xs text-gray-600 truncate">{card.business.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {cards.length > 4 && (
        <p className="text-center text-sm text-gray-500">
          ...and {cards.length - 4} more cards
        </p>
      )}
    </div>
  );
};

export default PWAWalletCard;
