
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        setScanningActive(true);
        
        // Start scanning for QR codes
        scanForQRCode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanningActive(false);
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
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR Code detected:', code.data);
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
    const customerData = prompt('Enter customer data (format: {"type":"customer","customerId":"123","customerName":"John Doe"}):');
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
        {!isScanning ? (
          <div className="text-center space-y-4">
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
            <p className="text-sm text-gray-600">
              Point your camera at a customer's QR code
            </p>
            <Button variant="outline" onClick={handleManualInput} className="w-full">
              Manual Input (Demo)
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-purple-500"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-purple-500"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-purple-500"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-purple-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    Point camera at QR code
                  </div>
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
