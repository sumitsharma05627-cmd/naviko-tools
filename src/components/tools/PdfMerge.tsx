import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
}

export const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfSize, setMergedPdfSize] = useState<number>(0);
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

  const processFiles = async (newFilesList: File[]) => {
    setErrorMessage(null);
    const validPdfs = newFilesList.filter((f) => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');

    if (validPdfs.length === 0) {
      setErrorMessage('Please select valid PDF documents (.pdf files only).');
      return;
    }

    if (validPdfs.length < newFilesList.length) {
      setErrorMessage('Some non-PDF files were skipped.');
    }

    const newItems: PdfFileItem[] = [];

    for (const file of validPdfs) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let pageCount: number | null = null;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        pageCount = pdfDoc.getPageCount();
      } catch {
        // If unreadable or password-protected
        pageCount = null;
      }

      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        pageCount
      });
    }

    setFiles((prev) => [...prev, ...newItems]);
    setMergedPdfUrl(null);
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
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
    setMergedPdfUrl(null);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
    setMergedPdfUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdfUrl(null);
  };

  const clearAll = () => {
    setFiles([]);
    setMergedPdfUrl(null);
    setMergedPdfSize(0);
    setErrorMessage(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Initializing PDF merger...');

      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        setProgressText(`Processing document ${i + 1} of ${files.length} (${item.name})...`);
        const fileBytes = await item.file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const pageIndices = sourceDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(sourceDoc, pageIndices);

        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }
      }

      setProgressText('Finalizing merged document...');
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
      setMergedPdfSize(blob.size);
      setProgressText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error merging PDFs';
      setErrorMessage(`Failed to merge PDF files: ${msg}. Please ensure your PDFs are not encrypted or password protected.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = 'naviko-merged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalPages = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  const totalInputSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <span className="font-bold">100% Client-Side Privacy: </span>
          <span>Your files are processed locally in your browser and are not uploaded to any server.</span>
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

      {/* Upload Box */}
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
          accept=".pdf,application/pdf"
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
              {files.length === 0 ? 'Choose PDF files or drop them here' : 'Add more PDF files'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select 2 or more PDF documents to merge into a single file
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Select PDF Files
          </button>
        </div>
      </div>

      {/* Files List & Reordering */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Files to Merge ({files.length})</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total size: {formatFileSize(totalInputSize)} • Total pages: ~{totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Files
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0 border border-indigo-100 dark:border-indigo-900">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{formatFileSize(item.size)}</span>
                      <span>•</span>
                      <span>{item.pageCount !== null ? `${item.pageCount} ${item.pageCount === 1 ? 'page' : 'pages'}` : 'PDF Document'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    title="Move Down"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    title="Remove File"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {!mergedPdfUrl ? (
              <button
                onClick={mergePdfs}
                disabled={isProcessing || files.length < 2}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{progressText || 'Merging PDF Documents...'}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Merge {files.length} PDF Files</span>
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
                      PDFs Merged Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Merged {files.length} files ({totalPages} pages) • File size: {formatFileSize(mergedPdfSize)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Merged PDF</span>
                  </button>
                  <button
                    onClick={mergePdfs}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                  >
                    Merge Again
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
