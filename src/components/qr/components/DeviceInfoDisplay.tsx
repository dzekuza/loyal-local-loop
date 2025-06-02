
import React from 'react';
import { DeviceInfo } from '@/utils/deviceDetection';

interface DeviceInfoDisplayProps {
  deviceInfo: DeviceInfo;
  videoState: string;
  streamStatus: string;
}

const DeviceInfoDisplay: React.FC<DeviceInfoDisplayProps> = ({
  deviceInfo,
  videoState,
  streamStatus
}) => {
  return (
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
  );
};

export default DeviceInfoDisplay;
