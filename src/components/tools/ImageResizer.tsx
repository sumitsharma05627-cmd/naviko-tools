import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Maximize2, Lock, Unlock, RefreshCw, Sparkles, Check, ShieldCheck } from 'lucide-react';

export const ImageResizer: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  const [resizedUrl, setResizedUrl] = useState<string>('');
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image (PNG, JPEG, WebP).');
      return;
    }

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    };
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setLockAspect(false);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  useEffect(() => {
    if (!originalUrl || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const img = new Image();
    img.src = originalUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setResizedSize(blob.size);
            const compUrl = URL.createObjectURL(blob);
            setResizedUrl(compUrl);
          }
          setIsProcessing(false);
        },
        format,
        0.92
      );
    };
  }, [originalUrl, targetWidth, targetHeight, format]);

  const handleDownload = () => {
    if (!resizedUrl || !originalFile) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = format === 'image/png' ? '.png' : format === 'image/webp' ? '.webp' : '.jpg';
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-${targetWidth}x${targetHeight}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {!originalUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Maximize2 className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Upload Image to Resize
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Change pixel dimensions with aspect ratio lock or choose standard dimension presets.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Client-Side Processing
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dimension Controls */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Resolution &amp; Dimensions
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Original: {origWidth} × {origHeight} px
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Presets:</span>
              <button
                onClick={() => applyPreset(1920, 1080)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                1080p FHD (1920×1080)
              </button>
              <button
                onClick={() => applyPreset(1280, 720)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                720p HD (1280×720)
              </button>
              <button
                onClick={() => applyPreset(1080, 1080)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Square (1080×1080)
              </button>
              <button
                onClick={() => applyPreset(600, 600)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Passport (600×600)
              </button>
              <button
                onClick={() => {
                  setLockAspect(true);
                  setTargetWidth(origWidth);
                  setTargetHeight(origHeight);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-100"
              >
                Reset to Original
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Width Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full text-base font-bold px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Aspect Ratio Lock Toggle */}
              <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                    lockAspect
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>
              </div>

              {/* Height Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full text-base font-bold px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            {/* Output Format & Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Export Format:
                </span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/png">PNG (.png)</option>
                  <option value="image/webp">WebP (.webp)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setOriginalUrl('');
                  setOriginalFile(null);
                  setResizedUrl('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Resized Canvas Preview ({targetWidth} × {targetHeight} px)
              </div>
              <div className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                {isProcessing ? 'Rendering...' : 'Ready to Download'}
              </div>
            </div>

            <div className="w-full max-h-80 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 p-2">
              {resizedUrl ? (
                <img
                  src={resizedUrl}
                  alt="Resized preview"
                  className="max-h-72 max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-xs text-slate-400">Rendering preview...</div>
              )}
            </div>
          </div>

          {/* Download Action */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleDownload}
              disabled={!resizedUrl || isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download Resized Image ({targetWidth}×{targetHeight} px)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
