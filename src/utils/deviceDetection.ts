
export interface DeviceInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isSamsung: boolean;
  isOldAndroid: boolean;
  browserName: string;
  osVersion: string;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                   /mobile/i.test(userAgent) ||
                   ('ontouchstart' in window);
  
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isSamsung = /samsung/i.test(userAgent) || /sm-/i.test(userAgent) || /galaxy/i.test(userAgent);
  
  // Detect older Android versions (Android 6.0 and below)
  const androidVersionMatch = userAgent.match(/android\s([0-9\.]*)/);
  const androidVersion = androidVersionMatch ? parseFloat(androidVersionMatch[1]) : 0;
  const isOldAndroid = isAndroid && androidVersion <= 6.0;
  
  let browserName = 'unknown';
  if (userAgent.includes('chrome')) browserName = 'chrome';
  else if (userAgent.includes('firefox')) browserName = 'firefox';
  else if (userAgent.includes('safari')) browserName = 'safari';
  else if (userAgent.includes('samsung')) browserName = 'samsung';
  
  const osVersion = androidVersionMatch ? androidVersionMatch[1] : '';
  
  console.log('🔍 Device detected:', {
    isMobile,
    isAndroid,
    isIOS,
    isSamsung,
    isOldAndroid,
    browserName,
    osVersion,
    userAgent: userAgent.substring(0, 100)
  });
  
  return {
    isMobile,
    isAndroid,
    isIOS,
    isSamsung,
    isOldAndroid,
    browserName,
    osVersion
  };
};

export const getCameraConstraints = (deviceInfo: DeviceInfo): MediaStreamConstraints => {
  console.log('📱 Getting camera constraints for device:', deviceInfo);
  
  if (deviceInfo.isSamsung || deviceInfo.isOldAndroid) {
    // Samsung Galaxy S6 and older Android devices - use minimal constraints
    return {
      video: {
        facingMode: 'environment',
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 }
      }
    };
  }
  
  if (deviceInfo.isMobile) {
    // Modern mobile devices
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280, min: 640, max: 1920 },
        height: { ideal: 720, min: 480, max: 1080 }
      }
    };
  }
  
  // Desktop - full constraints
  return {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920, min: 1280, max: 3840 },
      height: { ideal: 1080, min: 720, max: 2160 },
      frameRate: { ideal: 30, min: 15 }
    }
  };
};
