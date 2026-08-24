import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileImage,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Plus,
  Sliders
} from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
}

type PageSizeOption = 'A4' | 'Letter' | 'Original';
type PageOrientation = 'portrait' | 'landscape' | 'auto';
type MarginOption = 'none' | 'small' | 'medium';

export const JpgToPdf: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState<number>(0);
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
    const validImages = filesList.filter((f) => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      setErrorMessage('Please upload valid image files (JPG, JPEG, PNG, WebP).');
      return;
    }

    const newItems: ImageItem[] = [];

    validImages.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            previewUrl: url,
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        ]);
      };
    });

    setPdfUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
    setPdfUrl(null);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
    setPdfUrl(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPdfUrl(null);
  };

  const clearAll = () => {
    setImages([]);
    setPdfUrl(null);
    setPdfSize(0);
    setErrorMessage(null);
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please upload at least one image to convert.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Initializing PDF document...');

      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setProgressText(`Converting image ${i + 1} of ${images.length} (${item.name})...`);

        // Convert image to jpeg bytes through canvas to ensure universal compatibility with PDFDocument
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((resolve, reject) => {
          if (img.complete) resolve(true);
          else {
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error('Image failed to load in canvas'));
          }
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || item.width || 800;
        canvas.height = img.naturalHeight || item.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const embeddedImage = await pdfDoc.embedJpg(jpegDataUrl);

        // Determine Page Dimensions
        let pageWidth = 595.28; // A4 default pt
        let pageHeight = 841.89;

        if (pageSize === 'Letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else if (pageSize === 'A4') {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else if (pageSize === 'Original') {
          pageWidth = item.width;
          pageHeight = item.height;
        }

        // Handle Orientation
        let isLandscape = false;
        if (orientation === 'landscape') {
          isLandscape = true;
        } else if (orientation === 'auto') {
          isLandscape = item.width > item.height;
        }

        if (pageSize !== 'Original') {
          if (isLandscape && pageWidth < pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          } else if (!isLandscape && pageWidth > pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        // Margins in points
        const marginSize = margin === 'none' ? 0 : margin === 'small' ? 20 : 40;
        const usableWidth = Math.max(10, pageWidth - marginSize * 2);
        const usableHeight = Math.max(10, pageHeight - marginSize * 2);

        // Scale image proportionally to fit inside usable dimensions
        const scaleX = usableWidth / embeddedImage.width;
        const scaleY = usableHeight / embeddedImage.height;
        const scale = Math.min(scaleX, scaleY);

        const drawWidth = embeddedImage.width * scale;
        const drawHeight = embeddedImage.height * scale;

        const xPos = marginSize + (usableWidth - drawWidth) / 2;
        const yPos = marginSize + (usableHeight - drawHeight) / 2;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: drawWidth,
          height: drawHeight
        });
      }

      setProgressText('Compiling PDF file...');
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPdfSize(blob.size);
      setProgressText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error converting images';
      setErrorMessage(`Failed to create PDF: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'naviko-images.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
          accept="image/jpeg,image/jpg,image/png,image/webp"
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
              {images.length === 0 ? 'Upload JPG or PNG images' : 'Add more images'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select multiple photos to combine them into an ordered, printable PDF
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Select Images
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-6">
          {/* Options Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                PDF Page Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Page Size
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['A4', 'Letter', 'Original'] as PageSizeOption[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setPdfUrl(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        pageSize === size
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'portrait', label: 'Portrait' },
                    { key: 'landscape', label: 'Landscape' },
                    { key: 'auto', label: 'Auto' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setOrientation(item.key as PageOrientation);
                        setPdfUrl(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        orientation === item.key
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Margin
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'none', label: 'None' },
                    { key: 'small', label: 'Small' },
                    { key: 'medium', label: 'Big' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setMargin(item.key as MarginOption);
                        setPdfUrl(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        margin === item.key
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Images Grid & Reordering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Selected Images ({images.length})
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:border-indigo-400 transition-all p-2 flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-slate-950/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="mt-2 min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatFileSize(item.size)} • {item.width}×{item.height}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="Move Earlier"
                        className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === images.length - 1}
                        title="Move Later"
                        className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeImage(item.id)}
                      title="Remove"
                      className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action / Result */}
          <div className="pt-2">
            {!pdfUrl ? (
              <button
                onClick={convertToPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{progressText || 'Generating PDF...'}</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4" />
                    <span>Convert {images.length} Images to PDF</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      PDF Created Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {images.length} pages generated • File size: {formatFileSize(pdfSize)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={convertToPdf}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
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
