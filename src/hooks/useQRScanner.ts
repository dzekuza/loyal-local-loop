
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

interface UseQRScannerProps {
  onScan: (result: string) => void;
  cleanup: () => void;
}

export const useQRScanner = ({ onScan, cleanup }: UseQRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

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

  const stopScanning = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return stopScanning;
  }, [stopScanning]);

  return {
    isScanning,
    setIsScanning,
    videoRef,
    canvasRef,
    startManualScanning,
    stopScanning
  };
};
