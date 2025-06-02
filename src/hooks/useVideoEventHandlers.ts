
import { useCallback } from 'react';
import { DeviceInfo } from '@/utils/deviceDetection';

interface UseVideoEventHandlersProps {
  deviceInfo: DeviceInfo;
  setVideoState: (state: string) => void;
  setCameraLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsScanning: (scanning: boolean) => void;
  startManualScanning: () => void;
}

export const useVideoEventHandlers = ({
  deviceInfo,
  setVideoState,
  setCameraLoading,
  setError,
  setIsScanning,
  startManualScanning
}: UseVideoEventHandlersProps) => {
  
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
  }, [deviceInfo, setVideoState, setCameraLoading, setError, setIsScanning, startManualScanning]);

  const triggerVideoPlay = useCallback((video: HTMLVideoElement) => {
    console.log('📱 Manual video play trigger for iOS');
    video.play().then(() => {
      console.log('✅ Manual video play successful');
      setVideoState('playing');
      setCameraLoading(false);
      setIsScanning(true);
      startManualScanning();
    }).catch(err => {
      console.error('❌ Manual video play error:', err);
      setError('Unable to start video. Please try refreshing the page.');
    });
  }, [setVideoState, setCameraLoading, setError, setIsScanning, startManualScanning]);

  return {
    setupVideoEventListeners,
    triggerVideoPlay
  };
};
