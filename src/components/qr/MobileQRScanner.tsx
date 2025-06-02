
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useQRScanner } from '@/hooks/useQRScanner';
import { useVideoEventHandlers } from '@/hooks/useVideoEventHandlers';
import DeviceInfoDisplay from './components/DeviceInfoDisplay';
import CameraErrorDisplay from './components/CameraErrorDisplay';
import ScanningInterface from './components/ScanningInterface';

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
  const [userGestureRequired, setUserGestureRequired] = useState(false);
  const { toast } = useToast();
  
  const {
    permissionGranted,
    cameraLoading,
    setCameraLoading,
    videoState,
    setVideoState,
    streamStatus,
    setStreamStatus,
    error,
    setError,
    streamRef,
    deviceInfo,
    cleanup,
    requestPermissionAndStart
  } = useCameraStream();

  const {
    isScanning,
    setIsScanning,
    videoRef,
    canvasRef,
    startManualScanning,
    stopScanning
  } = useQRScanner({ onScan, cleanup });

  const { setupVideoEventListeners, triggerVideoPlay } = useVideoEventHandlers({
    deviceInfo,
    setVideoState,
    setCameraLoading,
    setError,
    setIsScanning,
    startManualScanning
  });

  // Auto-detect requirements
  useEffect(() => {
    if (deviceInfo.requiresUserGesture) {
      setUserGestureRequired(true);
    }
  }, [deviceInfo]);

  useEffect(() => {
    return () => {
      stopScanning();
      cleanup();
    };
  }, [stopScanning, cleanup]);

  const startCameraWithVideo = async () => {
    try {
      const stream = await requestPermissionAndStart();
      if (stream && videoRef.current) {
        const video = videoRef.current;
        
        setupVideoEventListeners(video);
        
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.style.objectFit = 'cover';
        
        video.srcObject = stream;
        setStreamStatus('assigned');
        
        console.log('📱 Video element configured');
        
        if (!deviceInfo.isIOS) {
          video.onloadedmetadata = () => {
            video.play().then(() => {
              console.log('✅ Non-iOS video started successfully');
              setVideoState('playing');
              setCameraLoading(false);
              setIsScanning(true);
              startManualScanning();
            }).catch(err => {
              console.error('❌ Non-iOS video play error:', err);
              setError('Failed to start video playback');
              setCameraLoading(false);
            });
          };
        }
        
        setTimeout(() => {
          if (videoState === 'initializing' || videoState === 'loading') {
            console.warn('⚠️ Video loading timeout');
            setError('Video loading timed out. Please try again.');
            setCameraLoading(false);
          }
        }, 10000);
      }
      
      toast({
        title: "Camera Access Granted ✅",
        description: "Starting QR code scanner...",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTriggerVideoPlay = () => {
    if (videoRef.current && streamRef.current) {
      triggerVideoPlay(videoRef.current);
    }
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

  const handleStopScanning = () => {
    stopScanning();
    cleanup();
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
        <DeviceInfoDisplay 
          deviceInfo={deviceInfo}
          videoState={videoState}
          streamStatus={streamStatus}
        />

        {error && (
          <CameraErrorDisplay
            error={error}
            permissionGranted={permissionGranted}
            deviceInfo={deviceInfo}
            onRetry={startCameraWithVideo}
          />
        )}

        {userGestureRequired && !isScanning && !cameraLoading && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>iOS Safari detected</strong><br />
              <span className="text-xs text-yellow-600">Tap "Start Camera" to enable camera access</span>
            </p>
          </div>
        )}

        {!isScanning && !cameraLoading && !error && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-2">
                📱 <strong>Mobile QR Scanner Ready</strong>
              </p>
              <p className="text-xs text-green-600">
                Using jsQR library | Optimized for {deviceInfo.browserName} on {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'}
              </p>
            </div>
            <Button onClick={startCameraWithVideo} className="w-full" size="lg">
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
            <p className="text-sm text-gray-500 mt-2">Video state: {videoState}</p>
            
            {deviceInfo.isIOS && cameraLoading && (
              <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>iOS:</strong> If camera doesn't appear, try tapping the video area when it loads
                </p>
                {streamStatus === 'assigned' && videoState !== 'playing' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTriggerVideoPlay}
                    className="mt-2"
                  >
                    Tap to Start Video
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {isScanning && (
          <ScanningInterface
            videoRef={videoRef}
            canvasRef={canvasRef}
            deviceInfo={deviceInfo}
            videoState={videoState}
            streamStatus={streamStatus}
            onStop={handleStopScanning}
            onManualInput={handleManualInput}
            onTriggerVideo={handleTriggerVideoPlay}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MobileQRScanner;
