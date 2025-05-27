import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ScanQRCodePage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScan = (data: any) => {
    if (data && data.text) {
      setScanResult(data.text);
      toast({
        title: 'QR Code Scanned',
        description: data.text,
      });
      // TODO: Connect to point collection logic here
    }
  };

  const handleError = (err: any) => {
    setError('Camera error: ' + err?.message || 'Unknown error');
    toast({
      title: 'Camera Error',
      description: err?.message || 'Unknown error',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <div className="w-full flex flex-col items-center mb-4">
          <QrScanner
            delay={300}
            style={{ width: '100%' }}
            onError={handleError}
            onScan={handleScan}
          />
        </div>
        {scanResult && (
          <div className="mb-4 text-green-600 font-semibold">Result: {scanResult}</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}
        <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
      </div>
    </div>
  );
};

export default ScanQRCodePage; 