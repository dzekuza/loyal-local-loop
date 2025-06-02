
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Camera, QrCode, X, AlertCircle, RefreshCw, Shield, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectDevice, requestCameraPermission, getCameraConstraints } from '@/utils/deviceDetection';
import jsQR from 'jsqr';

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
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [userGestureRequired, setUserGestureRequired] = useState(false);
  const [videoState, setVideoState] = useState<string>('idle');
  const [streamStatus, setStreamStatus] = useState<string>('none');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  const deviceInfo = detectDevice();

  // Auto-detect requirements
  useEffect(() => {
    if (deviceInfo.requiresUserGesture) {
      setUserGestureRequired(true);
    }
  }, [deviceInfo]);

  // Enhanced video event listeners for iOS
  const setupVideoEventListeners = useCallback((video: HTMLVideoElement) => {
    console.log('📱 Setting up video event listeners for iOS...');
    
    video.onloadstart = () => {
      console.log('📱 Video loadstart event');
      setVideoState('loading');
    };

    video.onloadedmetadata = () => {
      console.log('📱 Video metadata loaded');
      setVideoState('metadata-loaded');
    };

    video.onloadeddata = () => {
      console.log('📱 Video data loaded');
      setVideoState('data-loaded');
    };

    video.oncanplay = () => {
      console.log('📱 Video can play');
      setVideoState('can-play');
      
      // For iOS, we need to explicitly play the video
      if (deviceInfo.isIOS) {
        video.play().then(() => {
          console.log('✅ iOS video playing successfully');
          setVideoState('playing');
          setCameraLoading(false);
          setIsScanning(true);
          startManualScanning();
        }).catch(err => {
          console.error('❌ iOS video play error:', err);
          setError('Failed to start video on iOS. Try tapping the video area.');
          setCameraLoading(false);
        });
      }
    };

    video.onplaying = () => {
      console.log('📱 Video playing event');
      setVideoState('playing');
      if (!deviceInfo.isIOS) {
        setCameraLoading(false);
        setIsScanning(true);
        startManualScanning();
      }
    };

    video.onerror = (e) => {
      console.error('❌ Video error:', e);
      setVideoState('error');
      setError('Video display error. Please try again.');
      setCameraLoading(false);
    };

    video.onstalled = () => {
      console.warn('⚠️ Video stalled');
      setVideoState('stalled');
    };

    video.onwaiting = () => {
      console.log('📱 Video waiting for data');
      setVideoState('waiting');
    };
  }, [deviceInfo, startManualScanning]);

  // Cleanup camera stream
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up camera resources...');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔒 Camera track stopped');
      });
      streamRef.current = null;
      setStreamStatus('stopped');
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadstart = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.onerror = null;
    }
    
    setIsScanning(false);
    setCameraLoading(false);
    setVideoState('idle');
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Manual video scanning with jsQR
  const startManualScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

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
          console.log('🎯 QR scan successful:', code.data);
          
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
  }, [isScanning, onScan, toast, cleanup]);

  // Enhanced camera start with iOS-specific handling
  const startCamera = async () => {
    console.log('📱 Starting camera for device:', deviceInfo);
    setCameraLoading(true);
    setError(null);
    setVideoState('initializing');

    try {
      const constraints = getCameraConstraints(deviceInfo);
      console.log('📷 Using camera constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setStreamStatus('active');

      console.log('📱 Stream obtained:', {
        tracks: stream.getTracks().length,
        videoTracks: stream.getVideoTracks().length,
        active: stream.active
      });

      if (videoRef.current) {
        const video = videoRef.current;
        
        // Setup event listeners before assigning stream
        setupVideoEventListeners(video);
        
        // For iOS, we need to ensure the video element is ready
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.style.objectFit = 'cover';
        
        video.srcObject = stream;
        setStreamStatus('assigned');
        
        console.log('📱 Video element configured for iOS');
        
        // For non-iOS devices, fallback to original logic
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
        
        // Add timeout for video loading
        setTimeout(() => {
          if (videoState === 'initializing' || videoState === 'loading') {
            console.warn('⚠️ Video loading timeout');
            setError('Video loading timed out. Please try again.');
            setCameraLoading(false);
          }
        }, 10000);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraLoading(false);
      setStreamStatus('error');
      handleCameraError(error);
    }
  };

  // Handle camera errors with device-specific messages
  const handleCameraError = (error: any) => {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        setPermissionGranted(false);
        setError('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (error.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.');
      } else if (error.name === 'OverconstrainedError') {
        setError('Camera settings not supported. Trying basic mode...');
        // Try with basic constraints
        setTimeout(async () => {
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            });
            streamRef.current = basicStream;
            setStreamStatus('basic-active');
            
            if (videoRef.current) {
              const video = videoRef.current;
              setupVideoEventListeners(video);
              video.srcObject = basicStream;
              setError(null);
            }
          } catch (basicError) {
            setError('Camera initialization failed completely.');
            setStreamStatus('failed');
          }
        }, 1000);
        return;
      } else {
        setError(error.message);
      }
    } else {
      setError('Camera access failed. Please check permissions.');
    }
  };

  // Manual video trigger for iOS
  const triggerVideoPlay = () => {
    if (videoRef.current && streamRef.current) {
      console.log('📱 Manual video play trigger for iOS');
      videoRef.current.play().then(() => {
        console.log('✅ Manual video play successful');
        setVideoState('playing');
        setCameraLoading(false);
        setIsScanning(true);
        startManualScanning();
      }).catch(err => {
        console.error('❌ Manual video play error:', err);
        setError('Unable to start video. Please try refreshing the page.');
      });
    }
  };

  // Request permission and start scanner
  const requestPermissionAndStart = async () => {
    console.log('📱 Requesting camera permission for mobile QR scanner...');
    setError(null);
    
    try {
      const granted = await requestCameraPermission();
      
      if (granted) {
        console.log('✅ Permission granted, starting scanner');
        setPermissionGranted(true);
        await startCamera();
        
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
        {/* Enhanced Device Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Device:</strong> {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'} | 
            <strong> Browser:</strong> {deviceInfo.browserName} | 
            <strong> Method:</strong> jsQR scanning
            {deviceInfo.isProblematicDevice && <span className="text-yellow-600"> (Compatibility Mode)</span>}
          </p>
          {(videoState !== 'idle' || streamStatus !== 'none') && (
            <p className="text-xs text-blue-600 mt-1">
              <strong>Video:</strong> {videoState} | <strong>Stream:</strong> {streamStatus}
            </p>
          )}
        </div>

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
                <strong>Enable camera on {deviceInfo.browserName}:</strong><br />
                {deviceInfo.isIOS ? (
                  <>• Settings → Safari → Camera → Allow<br />• Or tap the camera icon in Safari's address bar</>
                ) : deviceInfo.isAndroid ? (
                  <>• Settings → Apps → {deviceInfo.browserName} → Permissions → Camera → Allow<br />• Or tap the camera icon in your browser's address bar</>
                ) : (
                  <>• Click the camera icon in your browser's address bar<br />• Or check browser settings → Privacy → Camera</>
                )}
              </div>
            )}
            
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestPermissionAndStart}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
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
            <Button onClick={requestPermissionAndStart} className="w-full" size="lg">
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
            
            {/* iOS-specific help during loading */}
            {deviceInfo.isIOS && cameraLoading && (
              <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>iOS:</strong> If camera doesn't appear, try tapping the video area when it loads
                </p>
                {streamStatus === 'assigned' && videoState !== 'playing' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerVideoPlay}
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
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }} // Mirror effect for better UX
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Enhanced scanning overlay */}
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
              
              {/* iOS manual trigger overlay */}
              {deviceInfo.isIOS && videoState !== 'playing' && streamStatus === 'assigned' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Button 
                    onClick={triggerVideoPlay}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Video
                  </Button>
                </div>
              )}
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
                🎯 <strong>Scanning active...</strong><br />
                <span className="text-xs text-green-600">Point camera at the QR code</span>
              </p>
              {deviceInfo.isIOS && (
                <p className="text-xs text-green-600 text-center mt-1">
                  iOS: If video is black, tap "Start Video" button
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileQRScanner;
