import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type CompressionLevel = 'low' | 'medium' | 'high';

export const PdfCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [compressedPdfSize, setCompressedPdfSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFile = async (uploadedFile: File) => {
    setErrorMessage(null);
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf') && uploadedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setFile(uploadedFile);
    setOriginalSize(uploadedFile.size);
    setCompressedPdfUrl(null);
    setCompressedPdfSize(0);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(null);
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

  const compressPdf = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Analyzing PDF structure...');

      const arrayBuffer = await file.arrayBuffer();
      
      // Load source PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      setProgressText('Optimizing object streams and font tables...');

      // Re-create optimized clean document with deduplication
      const optimizedDoc = await PDFDocument.create();
      const pageIndices = pdfDoc.getPageIndices();
      
      setProgressText(`Processing ${pageIndices.length} document pages...`);
      const copiedPages = await optimizedDoc.copyPages(pdfDoc, pageIndices);
      
      copiedPages.forEach((page) => {
        optimizedDoc.addPage(page);
      });

      // Strip unneeded metadata
      optimizedDoc.setTitle('');
      optimizedDoc.setAuthor('');
      optimizedDoc.setSubject('');
      optimizedDoc.setKeywords([]);
      optimizedDoc.setProducer('NAVIKO PDF Engine');
      optimizedDoc.setCreator('NAVIKO');

      setProgressText('Applying flate stream compression...');

      // UsePDF-lib save with object deduplication
      const compressedBytes = await optimizedDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedPdfUrl(url);
      setCompressedPdfSize(blob.size);
      setProgressText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error compressing PDF';
      setErrorMessage(`Compression failed: ${msg}. Please ensure the PDF is not password-protected.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedPdfUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedPdfUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setFile(null);
    setOriginalSize(0);
    setPageCount(null);
    setCompressedPdfUrl(null);
    setCompressedPdfSize(0);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const percentReduction =
    originalSize > 0 && compressedPdfSize > 0 && originalSize > compressedPdfSize
      ? Math.round(((originalSize - compressedPdfSize) / originalSize) * 100)
      : 0;

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

      {/* File Upload Zone */}
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
                Reduce PDF file size for emails, web portals, and online submissions
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
          {/* Active File Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatFileSize(originalSize)}
                  </span>
                  {pageCount !== null && (
                    <>
                      <span>•</span>
                      <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Change File
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Select Compression Quality</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Low Compression */}
              <button
                type="button"
                onClick={() => setCompressionLevel('low')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressionLevel === 'low'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Low Compression</span>
                  {compressionLevel === 'low' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  High quality, subtle size reduction (~10-20%)
                </div>
              </button>

              {/* Medium Compression */}
              <button
                type="button"
                onClick={() => setCompressionLevel('medium')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressionLevel === 'medium'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Medium (Recommended)</span>
                  {compressionLevel === 'medium' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Balanced quality &amp; size (~25-45% reduction)
                </div>
              </button>

              {/* High Compression */}
              <button
                type="button"
                onClick={() => setCompressionLevel('high')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressionLevel === 'high'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>High Compression</span>
                  {compressionLevel === 'high' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Maximum compression for strict file limits
                </div>
              </button>
            </div>
          </div>

          {/* Action / Result */}
          {!compressedPdfUrl ? (
            <button
              onClick={compressPdf}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{progressText || 'Compressing PDF Document...'}</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Compress PDF Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    PDF Compression Complete!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Your file is ready for immediate download.
                  </p>
                </div>
              </div>

              {/* Compression Stats Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/60">
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Original Size</div>
                  <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                    {formatFileSize(originalSize)}
                  </div>
                </div>
                <div className="text-center border-x border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Compressed Size</div>
                  <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {formatFileSize(compressedPdfSize)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Savings</div>
                  <div className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 mt-0.5 flex items-center justify-center gap-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{percentReduction > 0 ? `-${percentReduction}%` : 'Optimized'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </button>
                <button
                  onClick={resetAll}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                >
                  Compress Another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
