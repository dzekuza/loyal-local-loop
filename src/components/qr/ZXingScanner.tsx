import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface ZXingScannerProps {
  onResult: (result: string) => void;
  onError?: (error: Error) => void;
}

const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

const ZXingScanner: React.FC<ZXingScannerProps> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<'init' | 'metadata' | 'canplay' | 'playing' | 'error'>('init');
  const [showTapPrompt, setShowTapPrompt] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let stopScan: (() => void) | undefined;
    let tapPromptTimeout: NodeJS.Timeout;

    if (videoRef.current) {
      console.log('[ZXingScanner] Attempting to start decodeFromVideoDevice');
      codeReader.decodeFromVideoDevice(
        undefined, // use default camera
        videoRef.current,
        (result, error, controls) => {
          if (result) {
            console.log('[ZXingScanner] QR code detected:', result.getText());
            onResult(result.getText());
            controls.stop();
          }
          if (error) {
            console.error('[ZXingScanner] Error during scan:', error);
            if (onError) onError(error);
          }
        }
      ).then(controls => {
        stopScan = controls.stop;
        console.log('[ZXingScanner] Scanner started, controls:', controls);
      }).catch(err => {
        console.error('[ZXingScanner] Failed to start scanner:', err);
        if (onError) onError(err);
      });

      // Show tap prompt if not playing after 2 seconds
      tapPromptTimeout = setTimeout(() => {
        if (videoState !== 'playing') {
          setShowTapPrompt(true);
        }
      }, 2000);
    } else {
      console.warn('[ZXingScanner] videoRef.current is null');
    }

    return () => {
      if (stopScan) {
        console.log('[ZXingScanner] Stopping scanner');
        stopScan();
      }
      clearTimeout(tapPromptTimeout);
    };
  }, [onResult, onError, videoState]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    console.log('[ZXingScanner] video loadedmetadata');
    setVideoState('metadata');
  };
  const handleCanPlay = () => {
    console.log('[ZXingScanner] video canplay');
    setVideoState('canplay');
  };
  const handlePlay = () => {
    console.log('[ZXingScanner] video playing');
    setVideoState('playing');
    setShowTapPrompt(false);
  };
  const handleError = (e: any) => {
    console.error('[ZXingScanner] video error', e);
    setVideoState('error');
  };

  // Tap to play handler for iOS
  const handleTapToPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        console.log('[ZXingScanner] video play() triggered by tap');
      }).catch(err => {
        console.error('[ZXingScanner] video play() error', err);
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <video
        ref={videoRef}
        style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#000' }}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onError={handleError}
        onClick={isIOS ? handleTapToPlay : undefined}
      />
      {showTapPrompt && isIOS && videoState !== 'playing' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          zIndex: 10,
          cursor: 'pointer',
        }} onClick={handleTapToPlay}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Tap to start camera</span>
        </div>
      )}
    </div>
  );
};

export default ZXingScanner; 