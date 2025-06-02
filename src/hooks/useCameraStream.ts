
import { useState, useRef, useCallback } from 'react';
import { detectDevice, requestCameraPermission, getCameraConstraints } from '@/utils/deviceDetection';

export const useCameraStream = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [videoState, setVideoState] = useState<string>('idle');
  const [streamStatus, setStreamStatus] = useState<string>('none');
  const [error, setError] = useState<string | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const deviceInfo = detectDevice();

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up camera resources...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔒 Camera track stopped');
      });
      streamRef.current = null;
      setStreamStatus('stopped');
    }
    
    setCameraLoading(false);
    setVideoState('idle');
  }, []);

  const handleCameraError = useCallback((error: any) => {
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
            setError(null);
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
  }, []);

  const startCamera = useCallback(async () => {
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

      return stream;
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraLoading(false);
      setStreamStatus('error');
      handleCameraError(error);
      throw error;
    }
  }, [deviceInfo, handleCameraError]);

  const requestPermissionAndStart = useCallback(async () => {
    console.log('📱 Requesting camera permission...');
    setError(null);
    
    try {
      const granted = await requestCameraPermission();
      
      if (granted) {
        console.log('✅ Permission granted, starting scanner');
        setPermissionGranted(true);
        return await startCamera();
      } else {
        console.warn('❌ Permission denied');
        setError('Camera permission is required to scan QR codes. Please enable camera access in your browser settings.');
        setPermissionGranted(false);
        throw new Error('Camera permission denied');
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError('Unable to access camera. Please check your device settings.');
      throw error;
    }
  }, [startCamera]);

  return {
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
    startCamera,
    requestPermissionAndStart
  };
};
