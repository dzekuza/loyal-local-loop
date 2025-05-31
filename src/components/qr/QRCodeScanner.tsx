
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
  title?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose, title = "Scan QR Code" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanningActive, setScanningActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setPermissionDenied(false);
    
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (!isSecure) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        return;
      }

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device or browser.');
        return;
      }

      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });

      console.log('Camera access granted, setting up video stream...');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        setScanningActive(true);
        
        // Wait for video to be ready before starting scan
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting QR scan...');
          scanForQRCode();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (error.name === 'NotSupportedError') {
          setError('Camera not supported in this browser.');
        } else {
          setError(`Camera error: ${error.message}`);
        }
      } else {
        setError('Unable to access camera. Please check your device permissions.');
      }

      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    setScanningActive(false);
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setError(null);
  };

  const scanForQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanningActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanForQRCode);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log('QR Code detected:', code.data);
        
        // Provide visual/audio feedback
        toast({
          title: "QR Code Scanned! ✅",
          description: "Processing customer information...",
        });
        
        onScan(code.data);
        stopCamera();
        return;
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    }

    // Continue scanning
    if (scanningActive) {
      requestAnimationFrame(scanForQRCode);
    }
  };

  const handleManualInput = () => {
    const customerData = prompt('Enter customer data for testing (format: {"type":"customer","customerId":"123","customerName":"John Doe"}):');
    if (customerData) {
      onScan(customerData);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
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
            {permissionDenied && (
              <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                <Shield className="w-4 h-4 inline mr-1" />
                To enable camera: Settings → Privacy → Camera → Allow this site
              </div>
            )}
          </div>
        )}

        {!isScanning ? (
          <div className="text-center space-y-4">
            <Button onClick={startCamera} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
            <p className="text-sm text-gray-600">
              Point your camera at a customer's QR code
            </p>
            <Button variant="outline" onClick={handleManualInput} className="w-full" size="sm">
              Manual Input (Demo)
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                autoPlay
                playsInline
                muted
                style={{ aspectRatio: '4/3' }}
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Enhanced Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br"></div>
                
                {/* Center target */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-500 rounded-lg bg-green-500/10">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="bg-black/70 text-white px-3 py-2 rounded text-sm font-medium">
                        Position QR code here
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Scanning animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-1 bg-green-500 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
              <Button onClick={handleManualInput} variant="outline" className="flex-1">
                Manual Input
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
