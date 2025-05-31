
import React, { useState, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectDevice, requestCameraPermission } from '@/utils/deviceDetection';

interface MobileQRScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
  title?: string;
}

const MobileQRScanner: React.FC<MobileQRScannerProps> = ({ 
  onScan, 
  onClose, 
  title = "Scan QR Code" 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const { toast } = useToast();
  
  const deviceInfo = detectDevice();

  const handleScan = useCallback((result: any, error: any) => {
    if (result) {
      console.log('📱 Mobile QR scan successful:', result.text);
      toast({
        title: "QR Code Scanned! ✅",
        description: "Processing customer information...",
      });
      onScan(result.text);
      setIsScanning(false);
    }
    
    if (error) {
      console.error('📱 Mobile QR scan error:', error);
      // Don't show every scanning error, only critical ones
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
        setIsScanning(false);
        setPermissionGranted(false);
      }
    }
  }, [onScan, toast]);

  const requestPermissionAndStart = async () => {
    console.log('📱 Requesting camera permission for mobile QR scanner...');
    setError(null);
    setPermissionRequested(true);
    
    try {
      const granted = await requestCameraPermission();
      
      if (granted) {
        console.log('✅ Permission granted, starting scanner');
        setPermissionGranted(true);
        setIsScanning(true);
        setCameraStarted(true);
        
        toast({
          title: "Camera Access Granted ✅",
          description: "Starting QR code scanner...",
        });
      } else {
        console.warn('❌ Permission denied');
        setError('Camera permission is required to scan QR codes. Please enable camera access in your browser settings.');
        setPermissionGranted(false);
        
        toast({
          title: "Camera Permission Required",
          description: "Please allow camera access to scan QR codes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError('Unable to access camera. Please check your device settings.');
      
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    console.log('📱 Stopping mobile QR scanner...');
    setIsScanning(false);
    setCameraStarted(false);
  };

  const handleManualInput = () => {
    const customerData = prompt('Enter customer QR data for testing:\n(Leave blank for demo data)');
    const demoData = JSON.stringify({
      type: 'customer',
      customerId: 'demo-customer-123',
      customerName: 'Demo Customer',
      timestamp: Date.now()
    });
    onScan(customerData || demoData);
  };

  // Enhanced constraints for Samsung and older Android devices
  const getConstraints = () => {
    if (deviceInfo.isSamsung || deviceInfo.isOldAndroid) {
      return {
        facingMode: 'environment'
      };
    }
    
    return {
      facingMode: { ideal: 'environment' }
    };
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Camera Error</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
            
            {!permissionGranted && (
              <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                <Shield className="w-4 h-4 inline mr-1" />
                <strong>How to enable camera on {deviceInfo.isSamsung ? 'Samsung' : 'mobile'}:</strong><br />
                • Settings → Apps → Browser → Permissions → Camera → Allow<br />
                • Or tap the camera icon in your browser's address bar
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestPermissionAndStart}
              className="mt-2 w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Permission Again
            </Button>
          </div>
        )}

        {deviceInfo.isSamsung && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Samsung Device Detected</strong><br />
              Using optimized camera settings for your device
            </p>
          </div>
        )}

        {!isScanning && !error && !permissionRequested && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2">
                📱 <strong>Mobile QR Scanner Ready</strong>
              </p>
              <p className="text-xs text-green-600">
                Optimized for your {deviceInfo.isSamsung ? 'Samsung' : 'mobile'} device
              </p>
            </div>
            <Button onClick={requestPermissionAndStart} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Request Camera Permission
            </Button>
            <Button variant="outline" onClick={handleManualInput} className="w-full" size="sm">
              Manual Input (Demo)
            </Button>
          </div>
        )}

        {permissionRequested && !permissionGranted && !error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Requesting camera permission...</p>
            <p className="text-sm text-gray-500 mt-2">Please allow camera access when prompted</p>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <QrReader
                onResult={handleScan}
                constraints={getConstraints()}
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl animate-pulse"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br animate-pulse"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-400 rounded-lg bg-green-400/10 flex items-center justify-center">
                    <div className="bg-black/70 text-white px-3 py-2 rounded text-sm font-medium">
                      Position QR code here
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
              <Button onClick={handleManualInput} variant="outline" className="flex-1">
                Manual Input
              </Button>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 text-center">
                📱 <strong>Scanning for QR codes...</strong><br />
                <span className="text-xs text-green-600">Point camera at the QR code</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileQRScanner;
