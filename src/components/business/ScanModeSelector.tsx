
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Scan, Keyboard } from 'lucide-react';

type ScanMode = 'qr' | 'manual';

interface ScanModeSelectorProps {
  scanMode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
}

const ScanModeSelector: React.FC<ScanModeSelectorProps> = ({ 
  scanMode, 
  onModeChange 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <Button
            variant={scanMode === 'qr' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none ${scanMode === 'qr' ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => onModeChange('qr')}
          >
            <Scan className="w-4 h-4 mr-2" />
            Scan QR Code
          </Button>
          <Button
            variant={scanMode === 'manual' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none ${scanMode === 'manual' ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => onModeChange('manual')}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Enter Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanModeSelector;
