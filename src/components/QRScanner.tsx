"use client";
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { CameraOff, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const pickDefaultDevice = (videoInputDevices: MediaDeviceInfo[]) => {
    const backCamera = videoInputDevices.find(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear')
    );
    return backCamera?.deviceId || videoInputDevices[0].deviceId;
  };

  const startScanning = async (deviceId?: string) => {
    try {
      setError('');
      setIsScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      setDevices(videoInputDevices);

      const targetDeviceId = deviceId || selectedDeviceId || pickDefaultDevice(videoInputDevices);
      setSelectedDeviceId(targetDeviceId);

      await codeReader.decodeFromVideoDevice(
        targetDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            setError('Error scanning QR code');
          }
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const switchDevice = async (deviceId: string) => {
    if (deviceId === selectedDeviceId) { setShowDeviceMenu(false); return; }
    stopScanning();
    setShowDeviceMenu(false);
    await startScanning(deviceId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative w-full h-full">

        {/* Camera switch button */}
        {devices.length > 1 && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowDeviceMenu((p) => !p)}
              className="bg-white/20 rounded-full p-2.5 text-white hover:bg-white/40 active:scale-95 transition-all"
              aria-label="Switch camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {showDeviceMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden">
                {devices.map((d) => (
                  <button
                    key={d.deviceId}
                    onClick={() => switchDevice(d.deviceId)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      d.deviceId === selectedDeviceId
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d.label || `Camera ${devices.indexOf(d) + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative w-full h-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Scanning frame overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="relative w-64 h-64 rounded-2xl border-2 border-indigo-400"
              style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
            >
              {/* Animated scan line */}
              {isScanning && (
                <div className="absolute left-2 right-2 h-0.5 bg-indigo-400 opacity-80 animate-scan-line" />
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-5 text-center">
            <p className="text-sm text-gray-300 mb-3">
              Position the QR code within the frame
            </p>
            {error && (
              <p className="text-red-400 text-xs mb-3">{error}</p>
            )}
            <button
              onClick={handleClose}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all mx-auto"
            >
              <CameraOff className="w-4 h-4" />
              Stop Scanning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}