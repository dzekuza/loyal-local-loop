import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X, AlertCircle, Shield, RefreshCw, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectDevice, getCameraConstraints, requestCameraPermission, getBasicCameraConstraints } from '@/utils/deviceDetection';
import MobileQRScanner from './MobileQRScanner';
import jsQR from 'jsqr';
import ZXingScanner from './ZXingScanner';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
  title?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose, title = "Scan QR Code" }) => {
  // Check device info BEFORE any hooks to avoid hook violations
  const deviceInfo = detectDevice();
  
  // Early routing to mobile scanner for problematic devices - moved before hooks
  if (deviceInfo.isProblematicDevice || deviceInfo.isMobile || deviceInfo.isIOS) {
    console.log('📱 Auto-routing to mobile scanner for device:', deviceInfo);
    return <MobileQRScanner onScan={onScan} onClose={onClose} title={title} />;
  }

  // Now we can safely use hooks since we won't early return
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [useMobileScanner, setUseMobileScanner] = useState(false);
  const [showZXing, setShowZXing] = useState(false);
  const { toast } = useToast();

  // If user manually switches to mobile scanner, render that
  if (useMobileScanner) {
    return <MobileQRScanner onScan={onScan} onClose={onClose} title={title} />;
  }

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up camera resources...');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('📷 Camera track stopped');
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setCameraLoading(false);
    setError(null);
  }, [stream]);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = async () => {
    console.log('🎥 Starting camera for desktop...');
    setError(null);
    setPermissionDenied(false);
    setCameraLoading(true);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('🔒 Requesting camera permissions...');
      
      const permissionGranted = await requestCameraPermission();
      
      if (!permissionGranted) {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access and try again.');
        setCameraLoading(false);
        return;
      }

      let constraints = getCameraConstraints(deviceInfo);
      console.log('📷 Using constraints:', constraints);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Camera access granted with full constraints');
        await setupVideoStream(mediaStream);
      } catch (error) {
        console.warn('⚠️ Full constraints failed, trying basic constraints');
        
        const basicConstraints = getBasicCameraConstraints();
        const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        console.log('✅ Camera access granted with basic constraints');
        await setupVideoStream(mediaStream);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraLoading(false);
      handleCameraError(error);
    }
  };

  const setupVideoStream = async (mediaStream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      
      videoRef.current.onloadedmetadata = () => {
        console.log('📹 Video metadata loaded');
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            console.log('▶️ Video playing, starting QR scan...');
            setIsScanning(true);
            setCameraLoading(false);
            startScanning();
          }).catch(err => {
            console.error('❌ Video play error:', err);
            setError('Failed to start video playback');
            setCameraLoading(false);
          });
        }
      };

      videoRef.current.onerror = (err) => {
        console.error('❌ Video error:', err);
        setError('Video playback error');
        setCameraLoading(false);
      };
    }
  };

  const handleCameraError = (error: any) => {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (error.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.');
      } else if (error.name === 'OverconstrainedError') {
        setError('Camera constraints not supported. Switching to mobile scanner...');
        setTimeout(() => setUseMobileScanner(true), 1000);
        return;
      } else {
        setError(error.message);
      }
    } else {
      setError('Camera access failed. Please check permissions.');
    }

    toast({
      title: "Camera Error",
      description: "Unable to access camera. You can try the mobile scanner instead.",
      variant: "destructive",
    });
  };

  // Start scanning loop
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const scan = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scan);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code && code.data) {
          console.log('🎯 QR Code detected:', code.data);
          
          toast({
            title: "QR Code Scanned! ✅",
            description: "Processing customer information...",
          });
          
          onScan(code.data);
          cleanup();
          return;
        }
      } catch (error) {
        console.error('❌ QR scan error:', error);
      }

      if (isScanning) {
        animationRef.current = requestAnimationFrame(scan);
      }
    };

    animationRef.current = requestAnimationFrame(scan);
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

  if (showZXing) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>ZXing QR Scanner (Experimental)</CardTitle>
        </CardHeader>
        <CardContent>
          <ZXingScanner
            onResult={onScan}
            onError={(err) => {
              setError('ZXing error: ' + err.message);
              setShowZXing(false);
            }}
          />
          <Button className="mt-4 w-full" variant="outline" onClick={() => setShowZXing(false)}>
            Back to Default Scanner
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        {/* Device info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Desktop Scanner</strong> | Browser: {deviceInfo.browserName} | 
            Device: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'}
          </p>
        </div>

        {/* Option to switch to mobile scanner */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setUseMobileScanner(true)}
            className="w-full mb-4"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Switch to Mobile Scanner
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Camera Error</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
            {permissionDenied && (
              <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                <Shield className="w-4 h-4 inline mr-1" />
                <strong>How to enable camera:</strong><br />
                • Settings → Privacy & Security → Camera → Allow this site<br />
                • Or click the camera icon in your browser's address bar
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startCamera}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUseMobileScanner(true)}
                className="flex-1"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Scanner
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowZXing(true)}
                className="flex-1"
              >
                Try ZXing Scanner
              </Button>
            </div>
          </div>
        )}

        {!isScanning && !cameraLoading && !error && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2">
                🖥️ <strong>Desktop QR Scanner</strong>
              </p>
              <p className="text-xs text-green-600">
                High-quality camera scanning optimized for {deviceInfo.browserName}
              </p>
            </div>
            <Button onClick={startCamera} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
            <Button variant="outline" onClick={handleManualInput} className="w-full" size="sm">
              Manual Input (Demo)
            </Button>
          </div>
        )}

        {cameraLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Starting camera...</p>
            <p className="text-sm text-gray-500 mt-2">Initializing desktop camera, please wait</p>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Enhanced scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl animate-pulse"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br animate-pulse"></div>
                
                {/* Center scanning area */}
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
              <Button onClick={cleanup} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
              <Button onClick={handleManualInput} variant="outline" className="flex-1">
                Manual Input
              </Button>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 text-center">
                🎯 <strong>Desktop scanning active...</strong><br />
                <span className="text-xs text-green-600">Move the QR code into the green box</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
