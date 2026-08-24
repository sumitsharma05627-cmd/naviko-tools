import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Palette
} from 'lucide-react';
import JSZip from 'jszip';

interface PngItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalUrl: string;
  jpgUrl: string | null;
  jpgBlob: Blob | null;
  jpgSize: number;
  width: number;
  height: number;
}

export const PngToJpg: React.FC = () => {
  const [items, setItems] = useState<PngItem[]>([]);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [quality, setQuality] = useState<number>(0.92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const processFiles = (filesList: File[]) => {
    setErrorMessage(null);
    const validPngs = filesList.filter(
      (f) => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
    );

    if (validPngs.length === 0) {
      setErrorMessage('Please select valid PNG image files.');
      return;
    }

    const newItems: PngItem[] = [];

    validPngs.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setItems((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            originalUrl: url,
            jpgUrl: null,
            jpgBlob: null,
            jpgSize: 0,
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        ]);
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const convertItemToJpg = async (item: PngItem): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = item.originalUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Fill background color for any transparent areas in the PNG
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw original PNG on top
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({ blob, url });
            } else {
              reject(new Error('JPG conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const convertAll = async () => {
    if (items.length === 0) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Converting PNG images to JPG format...');

      const updated = [...items];

      for (let i = 0; i < updated.length; i++) {
        setProgressText(`Converting image ${i + 1} of ${updated.length} (${updated[i].name})...`);
        const { blob, url } = await convertItemToJpg(updated[i]);
        updated[i].jpgBlob = blob;
        updated[i].jpgUrl = url;
        updated[i].jpgSize = blob.size;
      }

      setItems(updated);
      setProgressText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion error';
      setErrorMessage(`Conversion failed: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = (item: PngItem) => {
    if (!item.jpgUrl) return;
    const a = document.createElement('a');
    a.href = item.jpgUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllZip = async () => {
    const converted = items.filter((i) => i.jpgBlob);
    if (converted.length === 0) return;

    try {
      setIsProcessing(true);
      setProgressText('Creating ZIP file containing all JPGs...');

      const zip = new JSZip();
      converted.forEach((item) => {
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        if (item.jpgBlob) {
          zip.file(`${baseName}.jpg`, item.jpgBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naviko-converted-jpgs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating ZIP';
      setErrorMessage(`Failed to create ZIP: ${msg}`);
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setErrorMessage(null);
  };

  const convertedCount = items.filter((i) => i.jpgUrl).length;

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee */}
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

      {/* Upload Zone */}
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
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,image/png"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100">
              {items.length === 0 ? 'Choose PNG images or drop them here' : 'Add more PNG images'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Convert large PNG images into lightweight, optimized JPG pictures
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Select PNG Files
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Options Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                JPG Output Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Background Color for Transparency */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Background Color (for transparent areas)</span>
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'White', color: '#FFFFFF' },
                    { label: 'Black', color: '#000000' },
                    { label: 'Off-White', color: '#F8FAFC' }
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => {
                        setBgColor(preset.color);
                        setItems((prev) => prev.map((i) => ({ ...i, jpgUrl: null, jpgBlob: null })));
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        bgColor.toUpperCase() === preset.color.toUpperCase()
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 ml-1">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        setItems((prev) => prev.map((i) => ({ ...i, jpgUrl: null, jpgBlob: null })));
                      }}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                      title="Choose Custom Color"
                    />
                  </div>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  JPG Image Quality
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setItems((prev) => prev.map((i) => ({ ...i, jpgUrl: null, jpgBlob: null })));
                    }}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-12 text-right">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Uploaded PNGs ({items.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add More
              </button>
              <button
                onClick={clearAll}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.jpgUrl || item.originalUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      PNG: {formatFileSize(item.size)} • {item.width}×{item.height}
                    </div>
                    {item.jpgUrl && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> JPG: {formatFileSize(item.jpgSize)}
                        {item.size > item.jpgSize && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 px-1 py-0.2 rounded font-semibold ml-1">
                            -{Math.round(((item.size - item.jpgSize) / item.size) * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.jpgUrl && (
                  <button
                    onClick={() => downloadSingle(item)}
                    className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download JPG
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2">
            {convertedCount === 0 ? (
              <button
                onClick={convertAll}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{progressText || 'Converting to JPG...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert {items.length} PNG {items.length === 1 ? 'Image' : 'Images'} to JPG</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      Conversion Complete!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {convertedCount} JPG images generated with high compression efficiency.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {convertedCount > 1 && (
                    <button
                      onClick={downloadAllZip}
                      disabled={isProcessing}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" /> Download All (ZIP)
                    </button>
                  )}
                  <button
                    onClick={convertAll}
                    className="px-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 cursor-pointer"
                  >
                    Re-convert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
