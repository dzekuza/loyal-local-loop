
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X, AlertCircle, Shield, RefreshCw } from 'lucide-react';
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
  const animationRef = useRef<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const { toast } = useToast();

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
    console.log('🎥 Starting camera...');
    setError(null);
    setPermissionDenied(false);
    setCameraLoading(true);
    
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Check for secure context (HTTPS or localhost)
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        throw new Error('Camera requires HTTPS or localhost');
      }

      console.log('🔒 Requesting camera permissions...');
      
      // Enhanced camera constraints for better mobile compatibility
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video to be ready
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
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraLoading(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (error.name === 'NotSupportedError') {
          setError('Camera not supported in this browser.');
        } else if (error.name === 'OverconstrainedError') {
          setError('Camera constraints not supported. Trying fallback...');
          // Try with basic constraints
          setTimeout(() => tryBasicCamera(), 1000);
          return;
        } else {
          setError(error.message);
        }
      } else {
        setError('Camera access failed. Please check permissions.');
      }

      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const tryBasicCamera = async () => {
    try {
      console.log('🔄 Trying basic camera constraints...');
      const basicStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = basicStream;
        setStream(basicStream);
        setError(null);
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error('❌ Basic camera also failed:', err);
      setError('Camera access failed completely');
    }
  };

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

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Get image data and scan for QR code
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code && code.data) {
          console.log('🎯 QR Code detected:', code.data);
          
          // Success feedback
          toast({
            title: "QR Code Scanned! ✅",
            description: "Processing customer information...",
          });
          
          // Trigger scan callback and cleanup
          onScan(code.data);
          cleanup();
          return;
        }
      } catch (error) {
        console.error('❌ QR scan error:', error);
      }

      // Continue scanning
      if (isScanning) {
        animationRef.current = requestAnimationFrame(scan);
      }
    };

    // Start the scanning loop
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
            {permissionDenied && (
              <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                <Shield className="w-4 h-4 inline mr-1" />
                <strong>How to enable camera:</strong><br />
                • Settings → Privacy & Security → Camera → Allow this site<br />
                • Or click the camera icon in your browser's address bar
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startCamera}
              className="mt-2 w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {!isScanning && !cameraLoading && !error && (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                📱 <strong>Ready to scan customer QR codes</strong>
              </p>
              <p className="text-xs text-blue-600">
                Point your camera at a customer's loyalty QR code to award points
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
            <p className="text-sm text-gray-500 mt-2">Please allow camera access if prompted</p>
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
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-1 bg-green-400 animate-pulse"></div>
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
                🎯 <strong>Scanning for QR codes...</strong><br />
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
