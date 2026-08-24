import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
  AlertCircle,
  RotateCcw as ResetIcon,
  ShieldCheck,
  Sparkles,
  Sliders
} from 'lucide-react';

type AspectRatioOption = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16' | '4:5';

export const ImageCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop box in percentage (0 to 100) of displayed image container
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80
  });

  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [croppedSize, setCroppedSize] = useState<number>(0);
  const [croppedDims, setCroppedDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; boxX: number; boxY: number }>({
    x: 0,
    y: 0,
    boxX: 0,
    boxY: 0
  });

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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    setCroppedPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (aspectRatio === 'free') return;

    let targetRatio = 1;
    if (aspectRatio === '1:1') targetRatio = 1;
    else if (aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (aspectRatio === '16:9') targetRatio = 16 / 9;
    else if (aspectRatio === '3:2') targetRatio = 3 / 2;
    else if (aspectRatio === '9:16') targetRatio = 9 / 16;
    else if (aspectRatio === '4:5') targetRatio = 4 / 5;

    setCropBox((prev) => {
      let w = 70;
      let h = w / targetRatio;
      if (h > 90) {
        h = 90;
        w = h * targetRatio;
      }
      if (w > 90) {
        w = 90;
        h = w / targetRatio;
      }
      return {
        x: Math.max(0, Math.min(100 - w, (100 - w) / 2)),
        y: Math.max(0, Math.min(100 - h, (100 - h) / 2)),
        width: w,
        height: h
      };
    });
  }, [aspectRatio]);

  // Generate cropped image on canvas
  const generateCrop = useCallback(() => {
    if (!imageSrc || !imageElementRef.current) return;

    const img = imageElementRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop in natural image dimensions
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const cropX = (cropBox.x / 100) * naturalW;
    const cropY = (cropBox.y / 100) * naturalH;
    const cropW = (cropBox.width / 100) * naturalW;
    const cropH = (cropBox.height / 100) * naturalH;

    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);

    ctx.save();

    // Handle transformations if any
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedPreviewUrl(url);
          setCroppedSize(blob.size);
          setCroppedDims({ w: canvas.width, h: canvas.height });
        }
      },
      outputFormat,
      outputFormat === 'image/png' ? undefined : quality
    );
  }, [imageSrc, cropBox, rotation, flipH, flipV, outputFormat, quality]);

  // Regenerate preview whenever parameters change
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        generateCrop();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, cropBox, rotation, flipH, flipV, outputFormat, quality, generateCrop]);

  // Mouse Dragging handler for the crop box
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100 - cropBox.width, dragStartRef.current.boxX + deltaXPercent));
    const newY = Math.max(0, Math.min(100 - cropBox.height, dragStartRef.current.boxY + deltaYPercent));

    setCropBox((prev) => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleDownload = () => {
    if (!croppedPreviewUrl || !file) return;
    const a = document.createElement('a');
    a.href = croppedPreviewUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    a.download = `${baseName}-cropped.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setFile(null);
    setImageSrc(null);
    setCroppedPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <span className="font-bold">100% Client-Side Privacy: </span>
          <span>Your files are processed locally in your browser and are not uploaded.</span>
        </div>
      </div>

      {/* Error Alert */}
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
              <Crop className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Choose an image or drop it here
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Crop, rotate, mirror, and export in custom aspect ratios (1:1, 16:9, 4:5, etc.)
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
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            {/* Aspect Ratio Row */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'free', label: 'Freeform' },
                  { key: '1:1', label: '1:1 Square' },
                  { key: '4:5', label: '4:5 Portrait' },
                  { key: '16:9', label: '16:9 Widescreen' },
                  { key: '4:3', label: '4:3 Standard' },
                  { key: '3:2', label: '3:2 Classic' },
                  { key: '9:16', label: '9:16 Story' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setAspectRatio(item.key as AspectRatioOption)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      aspectRatio === item.key
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform Controls & Output Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Transforms */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  Rotate &amp; Flip
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Rotate Left 90°"
                  >
                    <RotateCcw className="w-4 h-4" /> 90° Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Rotate Right 90°"
                  >
                    <RotateCw className="w-4 h-4" /> 90° Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH((f) => !f)}
                    className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      flipH
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" /> Flip H
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV((f) => !f)}
                    className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      flipV
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-4 h-4" /> Flip V
                  </button>
                </div>
              </div>

              {/* Format & Quality */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  Format &amp; Quality
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="image/jpeg">JPG / JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>

                  {outputFormat !== 'image/png' && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Quality:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source & Crop Box */}
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden select-none">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative max-h-[380px] max-w-full inline-block"
              >
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Original"
                  className="max-h-[380px] w-auto object-contain block opacity-50"
                  onLoad={() => generateCrop()}
                />

                {/* Draggable Crop Box Overlay */}
                <div
                  onMouseDown={handleMouseDown}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`
                  }}
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move transition-none"
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-white/40" />
                    <div className="border-r border-white/40" />
                    <div />
                  </div>

                  {/* Corner handles indicator */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-xs" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-xs" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-xs" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-xs" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-2">
                Click &amp; drag the highlighted box over the portion you wish to keep
              </div>
            </div>

            {/* Live Cropped Result Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Cropped Output
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {croppedDims.w} × {croppedDims.h} px • {formatFileSize(croppedSize)}
                  </div>
                </div>

                <div className="mt-4 bg-slate-100 dark:bg-slate-950 rounded-xl p-3 flex items-center justify-center min-h-[220px] max-h-[280px] overflow-hidden">
                  {croppedPreviewUrl ? (
                    <img
                      src={croppedPreviewUrl}
                      alt="Cropped Preview"
                      className="max-h-[260px] max-w-full object-contain rounded-lg shadow-xs"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Generating preview...</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!croppedPreviewUrl}
                  className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cropped Image</span>
                </button>
                <button
                  onClick={resetAll}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ResetIcon className="w-3.5 h-3.5" /> Upload Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
