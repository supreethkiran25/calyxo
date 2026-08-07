'use client';
import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Zap } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState('choose'); // 'choose' | 'camera' | 'preview'
  const [capturedImage, setCapturedImage] = useState(null); // base64 data URL preview
  const [capturedBlob, setCapturedBlob] = useState(null); // raw base64 string for Gemini
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const isMobile = typeof window !== 'undefined' &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Start camera stream (desktop)
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setMode('camera');
      setCameraError(null);
    } catch (err) {
      setCameraError('Camera access denied. Use the upload option instead.');
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, mode]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  // Capture frame from video
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      setCapturedImage(dataUrl);
      setCapturedBlob(base64);
      setMode('preview');
      stopCamera();
      onCapture(base64, dataUrl);
    } catch (err) {
      console.error("Frame capture error", err);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress to max 1024px before sending to Gemini
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1];
          setCapturedImage(dataUrl);
          setCapturedBlob(base64);
          setMode('preview');
          onCapture(base64, dataUrl);
        } catch (err) {
          console.error("Image processing error", err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setMode('choose');
  };

  const handleUsePhoto = () => {
    if (capturedBlob) onCapture(capturedBlob, capturedImage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Scan food
          </h2>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Choose mode */}
        {mode === 'choose' && (
          <div className="p-6 space-y-3">
            <p className="text-xs text-neutral-400 text-center mb-4">
              Point your camera at any food and Calyxo AI will identify it and extract the nutrition data.
            </p>

            {cameraError && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {cameraError}
              </div>
            )}

            {/* Mobile: native camera input */}
            {isMobile ? (
              <>
                <label className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  Open camera
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload from gallery
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            ) : (
              // Desktop: getUserMedia or file upload
              <>
                <button
                  onClick={startCamera}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Use webcam
                </button>
                <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}

            <p className="text-[11px] text-neutral-600 text-center pt-2">
              Works best with clear, well-lit photos of food on a plate or in a bowl.
            </p>
          </div>
        )}

        {/* Live camera (desktop) */}
        {mode === 'camera' && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover bg-black"
            />
            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-blue-400 rounded-2xl opacity-60">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-2xl" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
              <button
                onClick={captureFrame}
                className="w-16 h-16 rounded-full bg-white border-4 border-neutral-400 flex items-center justify-center hover:scale-95 transition-transform active:scale-90"
              >
                <Camera className="w-6 h-6 text-neutral-900" />
              </button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview mode */}
        {mode === 'preview' && capturedImage && (
          <div>
            <div className="relative">
              <img src={capturedImage} alt="Food preview" className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4 flex gap-3">
              <button
                onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <Zap className="w-4 h-4" />
                Analyse
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CameraCapture;
