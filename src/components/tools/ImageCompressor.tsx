import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Sparkles, RefreshCw, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP).');
      return;
    }

    setOriginalFile(file);
    setOriginalSize(file.size);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    if (!originalUrl) return;

    setIsCompressing(true);
    const img = new Image();
    img.src = originalUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCompressing(false);
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            const compUrl = URL.createObjectURL(blob);
            setCompressedUrl(compUrl);
          }
          setIsCompressing(false);
        },
        format,
        quality / 100
      );
    };
  }, [originalUrl, quality, format]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentReduction =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const handleDownload = () => {
    if (!compressedUrl || !originalFile) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const ext = format === 'image/webp' ? '.webp' : '.jpg';
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-compressed${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
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
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Click to upload or drag &amp; drop your image
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Supports PNG, JPEG, WebP up to high resolution. 100% private, never uploaded to any server.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Client-Side Processing
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Quality Slider */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Compression Quality: <span className="text-indigo-600 font-extrabold">{quality}%</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {quality > 80 ? 'High Quality' : quality > 50 ? 'Balanced' : 'Max Compression'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Format Selector */}
              <div className="sm:w-48 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full text-xs sm:text-sm font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/webp">WebP (Modern .webp)</option>
                </select>
              </div>

              {/* Change Image button */}
              <div className="sm:self-end">
                <button
                  onClick={() => {
                    setOriginalUrl('');
                    setOriginalFile(null);
                    setCompressedUrl('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Image
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Comparison Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Original Size
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatFileSize(originalSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Compressed Size
              </div>
              <div className="text-xl font-extrabold text-indigo-950 mt-1">
                {isCompressing ? 'Compressing...' : formatFileSize(compressedSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Saved Space
              </div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">
                {percentReduction > 0 ? `-${percentReduction}%` : '0%'}
              </div>
            </div>
          </div>

          {/* Before & After Visual Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Preview */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 self-start">
                Original Image
              </div>
              <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 self-start">
                Compressed Result Preview
              </div>
              <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-400">Rendering preview...</div>
                )}
              </div>
            </div>
          </div>

          {/* Download Action */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleDownload}
              disabled={!compressedUrl || isCompressing}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download Compressed Image ({formatFileSize(compressedSize)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
