import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface ZXingScannerProps {
  onResult: (result: string) => void;
  onError?: (error: Error) => void;
}

const ZXingScanner: React.FC<ZXingScannerProps> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let stopScan: (() => void) | undefined;

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
    } else {
      console.warn('[ZXingScanner] videoRef.current is null');
    }

    return () => {
      if (stopScan) {
        console.log('[ZXingScanner] Stopping scanner');
        stopScan();
      }
    };
  }, [onResult, onError]);

  return (
    <video ref={videoRef} style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#000' }} />
  );
};

export default ZXingScanner; 