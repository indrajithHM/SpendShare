"use client";
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );

      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
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

  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative w-full h-full">

        {/* Close button — now calls stopScanning + onClose */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 rounded-full p-2.5 text-white hover:bg-opacity-40 active:scale-95 transition-all"
          aria-label="Close scanner"
        >
         X {/* <X className="w-6 h-6" /> */}
        </button>

        {/* Back label under close for clarity */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white bg-opacity-20 rounded-full px-3 py-2 text-white text-sm font-medium hover:bg-opacity-40 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <X className="w-4 h-4" />
          Back
        </button>

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
            <div className="relative w-64 h-64">
              {/* Dimmed outer area effect via box shadow */}
              <div className="absolute inset-0 rounded-2xl ring-[9999px] ring-black/60" />
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-indigo-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-indigo-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-indigo-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-indigo-400 rounded-br-xl" />
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
              onClick={toggleScanning}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all mx-auto"
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Start Scanning
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}