import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Scissors,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sliders,
  Pipette,
  Palette,
  Eye,
  Check
} from 'lucide-react';

type BgReplacementMode = 'transparent' | 'color' | 'white';

export const BackgroundRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState<number>(35);
  const [smoothEdges, setSmoothEdges] = useState<number>(15);
  const [bgMode, setBgMode] = useState<BgReplacementMode>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#3B82F6');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFile = (uploadedFile: File) => {
    setErrorMessage(null);
    if (!uploadedFile.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setImageSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      sourceImageRef.current = img;
      // Auto-detect corner background color
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // sample 4 corners
        const p1 = ctx.getImageData(0, 0, 1, 1).data;
        const p2 = ctx.getImageData(img.naturalWidth - 1, 0, 1, 1).data;
        const p3 = ctx.getImageData(0, img.naturalHeight - 1, 1, 1).data;
        const p4 = ctx.getImageData(img.naturalWidth - 1, img.naturalHeight - 1, 1, 1).data;
        const avgR = Math.round((p1[0] + p2[0] + p3[0] + p4[0]) / 4);
        const avgG = Math.round((p1[1] + p2[1] + p3[1] + p4[1]) / 4);
        const avgB = Math.round((p1[2] + p2[2] + p3[2] + p4[2]) / 4);
        setTargetColor({ r: avgR, g: avgG, b: avgB });
      }
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Segmentation & Background Removal Algorithm
  const executeRemoval = useCallback(() => {
    if (!sourceImageRef.current) return;
    const img = sourceImageRef.current;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const { r: targetR, g: targetG, b: targetB } = targetColor;
      const tolSq = tolerance * tolerance * 3;
      const featherSq = (tolerance + smoothEdges) * (tolerance + smoothEdges) * 3;

      // Color distance algorithm with smooth alpha transition
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB space
        const dr = r - targetR;
        const dg = g - targetG;
        const db = b - targetB;
        const distSq = dr * dr + dg * dg + db * db;

        if (distSq <= tolSq) {
          // Fully background
          data[i + 3] = 0;
        } else if (distSq < featherSq && smoothEdges > 0) {
          // Smooth edge feathering
          const factor = (distSq - tolSq) / (featherSq - tolSq);
          data[i + 3] = Math.round(data[i + 3] * factor);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Handle replacement backdrop if selected
      if (bgMode === 'color' || bgMode === 'white') {
        const fillCanvas = document.createElement('canvas');
        fillCanvas.width = canvas.width;
        fillCanvas.height = canvas.height;
        const fillCtx = fillCanvas.getContext('2d');
        if (fillCtx) {
          fillCtx.fillStyle = bgMode === 'white' ? '#FFFFFF' : customBgColor;
          fillCtx.fillRect(0, 0, fillCanvas.width, fillCanvas.height);
          fillCtx.drawImage(canvas, 0, 0);
          fillCanvas.toBlob(
            (blob) => {
              if (blob) {
                setProcessedBlob(blob);
                setProcessedDataUrl(URL.createObjectURL(blob));
              }
              setIsProcessing(false);
            },
            'image/png'
          );
          return;
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            setProcessedDataUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        },
        'image/png'
      );
    } catch {
      setIsProcessing(false);
    }
  }, [targetColor, tolerance, smoothEdges, bgMode, customBgColor]);

  // Recalculate whenever parameters update
  useEffect(() => {
    if (imageSrc && sourceImageRef.current) {
      const timer = setTimeout(() => {
        executeRemoval();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, targetColor, tolerance, smoothEdges, bgMode, customBgColor, executeRemoval]);

  // Eyedropper click handler on original image
  const handleOriginalClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive || !sourceImageRef.current) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const canvas = document.createElement('canvas');
    canvas.width = sourceImageRef.current.naturalWidth;
    canvas.height = sourceImageRef.current.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(sourceImageRef.current, 0, 0);
      const pxX = Math.floor(xRatio * canvas.width);
      const pxY = Math.floor(yRatio * canvas.height);
      const pixel = ctx.getImageData(pxX, pxY, 1, 1).data;
      setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      setIsEyedropperActive(false);
    }
  };

  const handleDownload = () => {
    if (!processedDataUrl || !file) return;
    const a = document.createElement('a');
    a.href = processedDataUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-transparent.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setFile(null);
    setImageSrc(null);
    setProcessedDataUrl(null);
    setProcessedBlob(null);
    sourceImageRef.current = null;
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <span className="font-bold">100% Client-Side Privacy: </span>
          <span>Your images are processed locally in your browser and are never uploaded to any remote server.</span>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {!imageSrc ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Scissors className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Upload image to remove background
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Isolate portraits, products, signatures, and graphics with high-precision transparency
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Select Image
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Detection &amp; Background Options
                </h3>
              </div>

              {/* Eyedropper Toggle */}
              <button
                type="button"
                onClick={() => setIsEyedropperActive((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isEyedropperActive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                <span>{isEyedropperActive ? 'Click Background Color on Image' : 'Pick Color with Eyedropper'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Sliders: Tolerance & Feathering */}
              <div className="space-y-3 md:col-span-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Color Tolerance (Threshold)</span>
                    <span className="font-bold">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Edge Softness &amp; Feathering</span>
                    <span className="font-bold">{smoothEdges}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={smoothEdges}
                    onChange={(e) => setSmoothEdges(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Background Replacement Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Output Background
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBgMode('transparent')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      bgMode === 'transparent'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('white')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      bgMode === 'white'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Pure White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('color')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      bgMode === 'color'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Solid Color
                  </button>
                </div>

                {bgMode === 'color' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{customBgColor}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Original Image</span>
                {isEyedropperActive && (
                  <span className="text-[11px] font-bold text-indigo-600 animate-pulse">
                    Click anywhere on background to sample
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-[260px] max-h-[360px] bg-slate-100 dark:bg-slate-950 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={imageSrc}
                  alt="Original"
                  onClick={handleOriginalClick}
                  className={`max-h-[340px] max-w-full object-contain rounded ${
                    isEyedropperActive ? 'cursor-crosshair ring-2 ring-indigo-500' : ''
                  }`}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{file?.name}</span>
                <span>{formatFileSize(file?.size || 0)}</span>
              </div>
            </div>

            {/* Processed Transparent Result */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Removed Background
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {processedBlob ? formatFileSize(processedBlob.size) : 'Processing...'}
                </span>
              </div>

              {/* Checkerboard Background for Transparency */}
              <div
                className="flex-1 min-h-[260px] max-h-[360px] rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800"
                style={{
                  backgroundImage:
                    bgMode === 'transparent'
                      ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                      : 'none',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: bgMode === 'transparent' ? '#ffffff' : 'transparent'
                }}
              >
                {processedDataUrl ? (
                  <img
                    src={processedDataUrl}
                    alt="Removed Background Preview"
                    className="max-h-[340px] max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering transparency...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={handleDownload}
                  disabled={!processedDataUrl || isProcessing}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Transparent PNG</span>
                </button>
                <button
                  onClick={resetAll}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Another Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
