import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
  CheckSquare,
  Square,
  PackageCheck,
  Eye
} from 'lucide-react';
import JSZip from 'jszip';

interface ConvertedPage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  size: number;
  selected: boolean;
  width: number;
  height: number;
}

export const PdfToJpg: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure PDF.js script is loaded
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjs = (window as any).pdfjsLib;
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFile = async (uploadedFile: File) => {
    setErrorMessage(null);
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf') && uploadedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document (.pdf).');
      return;
    }

    setFile(uploadedFile);
    setOriginalSize(uploadedFile.size);
    setPages([]);
    setIsProcessing(true);
    setProgressPercent(5);
    setProgressText('Loading PDF library and document...');

    try {
      // Ensure pdfjsLib is ready
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) {
        // Wait up to 3 seconds for script load
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 100));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pdfjs = (window as any).pdfjsLib;
          if (pdfjs) break;
        }
      }

      if (!pdfjs) {
        throw new Error('PDF conversion engine could not be initialized. Please check your internet connection.');
      }

      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const convertedPages: ConvertedPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Rendering page ${i} of ${numPages} to high-res JPG...`);
        setProgressPercent(Math.round((i / numPages) * 90));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for sharp text

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
        });

        if (blob) {
          const dataUrl = URL.createObjectURL(blob);
          convertedPages.push({
            pageNumber: i,
            dataUrl,
            blob,
            size: blob.size,
            selected: true,
            width: viewport.width,
            height: viewport.height
          });
        }
      }

      setPages(convertedPages);
      setProgressPercent(100);
      setProgressText('All pages converted successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion error';
      setErrorMessage(`Failed to convert PDF to JPG: ${msg}. Make sure the PDF is not password protected.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const downloadSinglePage = (page: ConvertedPage) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    a.download = `${baseName}-page-${page.pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSelectedZip = async () => {
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setErrorMessage('Please select at least one page to download.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgressText('Packing JPG images into ZIP file...');

      const zip = new JSZip();
      const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';

      selectedPages.forEach((p) => {
        zip.file(`${baseName}-page-${p.pageNumber}.jpg`, p.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}-jpg-pages.zip`;
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

  const resetAll = () => {
    setFile(null);
    setPages([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedCount = pages.filter((p) => p.selected).length;

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
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Choose a PDF file or drag it here
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Extract high-resolution JPG images from every page of your PDF
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Select PDF File
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold">{formatFileSize(originalSize)}</span>
                  {pages.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{pages.length} {pages.length === 1 ? 'page' : 'pages'} extracted</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Change PDF
              </button>
            </div>
          </div>

          {/* Conversion Progress */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <span>{progressText}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Converted Pages Gallery */}
          {pages.length > 0 && (
            <div className="space-y-4">
              {/* Batch Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectAll(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Select All
                  </button>
                  <button
                    onClick={() => selectAll(false)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" /> Deselect All
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {selectedCount} of {pages.length} selected
                  </span>
                </div>

                <button
                  onClick={downloadSelectedZip}
                  disabled={selectedCount === 0 || isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Download {selectedCount} Selected (ZIP)</span>
                </button>
              </div>

              {/* Page Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {pages.map((p) => (
                  <div
                    key={p.pageNumber}
                    className={`relative rounded-xl bg-white dark:bg-slate-900 border transition-all p-2.5 flex flex-col justify-between ${
                      p.selected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    {/* Header: Checkbox & Page Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => togglePageSelection(p.pageNumber)}
                        className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            p.selected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {p.selected && <span className="text-[10px] leading-none">✓</span>}
                        </div>
                        <span>Page {p.pageNumber}</span>
                      </button>

                      <button
                        onClick={() => setPreviewModalUrl(p.dataUrl)}
                        title="Zoom Page"
                        className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div
                      onClick={() => togglePageSelection(p.pageNumber)}
                      className="aspect-3/4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-center relative group"
                    >
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Footer / Download single */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatFileSize(p.size)}</span>
                      <button
                        onClick={() => downloadSinglePage(p)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> JPG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden p-4 flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Page Preview</span>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-2 rounded-xl">
              <img src={previewModalUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
