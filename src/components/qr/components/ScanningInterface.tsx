
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { DeviceInfo } from '@/utils/deviceDetection';

interface ScanningInterfaceProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  deviceInfo: DeviceInfo;
  videoState: string;
  streamStatus: string;
  onStop: () => void;
  onManualInput: () => void;
  onTriggerVideo?: () => void;
}

const ScanningInterface: React.FC<ScanningInterfaceProps> = ({
  videoRef,
  canvasRef,
  deviceInfo,
  videoState,
  streamStatus,
  onStop,
  onManualInput,
  onTriggerVideo
}) => {
  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning overlay */}
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
        {deviceInfo.isIOS && videoState !== 'playing' && streamStatus === 'assigned' && onTriggerVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button 
              onClick={onTriggerVideo}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Video
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onStop} variant="outline" className="flex-1">
          Stop Scanning
        </Button>
        <Button onClick={onManualInput} variant="outline" className="flex-1">
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
  );
};

export default ScanningInterface;
