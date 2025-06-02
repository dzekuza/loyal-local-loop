
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { DeviceInfo } from '@/utils/deviceDetection';

interface CameraErrorDisplayProps {
  error: string;
  permissionGranted: boolean;
  deviceInfo: DeviceInfo;
  onRetry: () => void;
}

const CameraErrorDisplay: React.FC<CameraErrorDisplayProps> = ({
  error,
  permissionGranted,
  deviceInfo,
  onRetry
}) => {
  return (
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
          onClick={onRetry}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default CameraErrorDisplay;
