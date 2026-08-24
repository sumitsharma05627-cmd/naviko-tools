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
  Sliders
} from 'lucide-react';
import JSZip from 'jszip';

interface JpgItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalUrl: string;
  pngUrl: string | null;
  pngBlob: Blob | null;
  pngSize: number;
  width: number;
  height: number;
}

export const JpgToPng: React.FC = () => {
  const [items, setItems] = useState<JpgItem[]>([]);
  const [makeWhiteTransparent, setMakeWhiteTransparent] = useState<boolean>(false);
  const [colorTolerance, setColorTolerance] = useState<number>(20);
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
    const validJpgs = filesList.filter(
      (f) =>
        f.type === 'image/jpeg' ||
        f.type === 'image/jpg' ||
        f.name.toLowerCase().endsWith('.jpg') ||
        f.name.toLowerCase().endsWith('.jpeg')
    );

    if (validJpgs.length === 0) {
      setErrorMessage('Please select valid JPG / JPEG image files.');
      return;
    }

    const newItems: JpgItem[] = [];

    validJpgs.forEach((file) => {
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
            pngUrl: null,
            pngBlob: null,
            pngSize: 0,
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

  const convertItemToPng = async (item: JpgItem): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = item.originalUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        // If user wants pure white background to be transparent
        if (makeWhiteTransparent) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const threshold = 255 - colorTolerance;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If color is very close to pure white
            if (r >= threshold && g >= threshold && b >= threshold) {
              data[i + 3] = 0; // Transparent alpha
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ blob, url });
          } else {
            reject(new Error('PNG conversion failed'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const convertAll = async () => {
    if (items.length === 0) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Converting JPG images to lossless PNG format...');

      const updated = [...items];

      for (let i = 0; i < updated.length; i++) {
        setProgressText(`Converting image ${i + 1} of ${updated.length} (${updated[i].name})...`);
        const { blob, url } = await convertItemToPng(updated[i]);
        updated[i].pngBlob = blob;
        updated[i].pngUrl = url;
        updated[i].pngSize = blob.size;
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

  const downloadSingle = (item: JpgItem) => {
    if (!item.pngUrl) return;
    const a = document.createElement('a');
    a.href = item.pngUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllZip = async () => {
    const converted = items.filter((i) => i.pngBlob);
    if (converted.length === 0) return;

    try {
      setIsProcessing(true);
      setProgressText('Creating ZIP file containing all PNGs...');

      const zip = new JSZip();
      converted.forEach((item) => {
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        if (item.pngBlob) {
          zip.file(`${baseName}.png`, item.pngBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naviko-converted-pngs.zip';
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

  const convertedCount = items.filter((i) => i.pngUrl).length;

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
          accept=".jpg,.jpeg,image/jpeg"
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
              {items.length === 0 ? 'Choose JPG/JPEG images or drop them here' : 'Add more JPG images'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Convert lossy JPG photos into crisp, transparent-capable PNG images
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Select JPG Files
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
                PNG Conversion Settings
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={makeWhiteTransparent}
                  onChange={(e) => {
                    setMakeWhiteTransparent(e.target.checked);
                    // invalidate converted
                    setItems((prev) => prev.map((i) => ({ ...i, pngUrl: null, pngBlob: null })));
                  }}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Make White Background Transparent
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Useful for logos, icons, and product photos on white backdrops
                  </div>
                </div>
              </label>

              {makeWhiteTransparent && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tolerance:</span>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={colorTolerance}
                    onChange={(e) => {
                      setColorTolerance(parseInt(e.target.value, 10));
                      setItems((prev) => prev.map((i) => ({ ...i, pngUrl: null, pngBlob: null })));
                    }}
                    className="accent-indigo-600 w-28"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6">
                    {colorTolerance}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Uploaded Images ({items.length})
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
                      src={item.pngUrl || item.originalUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      JPG: {formatFileSize(item.size)} • {item.width}×{item.height}
                    </div>
                    {item.pngUrl && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PNG: {formatFileSize(item.pngSize)}
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

                {item.pngUrl && (
                  <button
                    onClick={() => downloadSingle(item)}
                    className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
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
                    <span>{progressText || 'Converting to PNG...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert {items.length} JPG {items.length === 1 ? 'Image' : 'Images'} to PNG</span>
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
                      {convertedCount} PNG images generated in lossless quality.
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
