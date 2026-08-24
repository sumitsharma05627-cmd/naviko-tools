import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileText,
  Scissors,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

type SplitMode = 'selected' | 'all' | 'ranges';

interface SplitResult {
  title: string;
  blob: Blob;
  url: string;
  size: number;
  pages: number[];
}

export const PdfSplit: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('selected');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('1-2, 3-4');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
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

  const handleFile = async (uploadedFile: File) => {
    setErrorMessage(null);
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf') && uploadedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF document (.pdf).');
      return;
    }

    setFile(uploadedFile);
    setOriginalSize(uploadedFile.size);
    setSplitResults([]);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      // Select first page by default
      setSelectedPages(count > 0 ? [1] : []);
      if (count > 2) {
        setRangeInput(`1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}`);
      } else {
        setRangeInput(`1-${count}`);
      }
    } catch {
      setErrorMessage('Could not inspect PDF pages. Ensure file is not encrypted.');
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

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAll = (select: boolean) => {
    if (select) {
      const all = Array.from({ length: totalPages }, (_, i) => i + 1);
      setSelectedPages(all);
    } else {
      setSelectedPages([]);
    }
  };

  const parseRanges = (input: string, maxPage: number): number[][] => {
    const segments = input.split(',').map((s) => s.trim()).filter(Boolean);
    const result: number[][] = [];

    for (const seg of segments) {
      if (seg.includes('-')) {
        const [startStr, endStr] = seg.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          const group: number[] = [];
          for (let p = Math.max(1, start); p <= Math.min(maxPage, end); p++) {
            group.push(p);
          }
          if (group.length > 0) result.push(group);
        }
      } else {
        const page = parseInt(seg, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPage) {
          result.push([page]);
        }
      }
    }
    return result;
  };

  const executeSplit = async () => {
    if (!file || totalPages === 0) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressText('Reading original PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const results: SplitResult[] = [];
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      if (splitMode === 'selected') {
        if (selectedPages.length === 0) {
          setErrorMessage('Please select at least one page to extract.');
          setIsProcessing(false);
          return;
        }

        setProgressText(`Extracting ${selectedPages.length} selected pages...`);
        const newDoc = await PDFDocument.create();
        const zeroIndexed = selectedPages.map((p) => p - 1);
        const copied = await newDoc.copyPages(sourceDoc, zeroIndexed);
        copied.forEach((cp) => newDoc.addPage(cp));

        const bytes = await newDoc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        results.push({
          title: `${baseName}-extracted.pdf`,
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          pages: selectedPages
        });
      } else if (splitMode === 'all') {
        setProgressText(`Splitting document into ${totalPages} individual pages...`);
        for (let i = 1; i <= totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(sourceDoc, [i - 1]);
          newDoc.addPage(copied[0]);
          const bytes = await newDoc.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          results.push({
            title: `${baseName}-page-${i}.pdf`,
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            pages: [i]
          });
        }
      } else if (splitMode === 'ranges') {
        const groups = parseRanges(rangeInput, totalPages);
        if (groups.length === 0) {
          setErrorMessage('Please enter valid page ranges (e.g., 1-2, 3-5).');
          setIsProcessing(false);
          return;
        }

        for (let idx = 0; idx < groups.length; idx++) {
          const group = groups[idx];
          setProgressText(`Extracting range ${idx + 1} of ${groups.length} (pages ${group.join(', ')})...`);
          const newDoc = await PDFDocument.create();
          const zeroIndexed = group.map((p) => p - 1);
          const copied = await newDoc.copyPages(sourceDoc, zeroIndexed);
          copied.forEach((cp) => newDoc.addPage(cp));
          const bytes = await newDoc.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          results.push({
            title: `${baseName}-part-${idx + 1}.pdf`,
            blob,
            url: URL.createObjectURL(blob),
            size: blob.size,
            pages: group
          });
        }
      }

      setSplitResults(results);
      setProgressText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Split failed';
      setErrorMessage(`Failed to split PDF: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllZip = async () => {
    if (splitResults.length === 0) return;
    try {
      setIsProcessing(true);
      setProgressText('Creating ZIP archive of split PDFs...');
      const zip = new JSZip();
      splitResults.forEach((item) => {
        zip.file(item.title, item.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
      a.download = `${baseName}-split-documents.zip`;
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

  const downloadSingle = (res: SplitResult) => {
    const a = document.createElement('a');
    a.href = res.url;
    a.download = res.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    setFile(null);
    setTotalPages(0);
    setSelectedPages([]);
    setSplitResults([]);
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
                Choose a PDF file to split
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Extract selected pages, separate all pages, or split by custom ranges
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
          {/* Active File Header */}
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
                  <span>•</span>
                  <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'} total</span>
                </div>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Change File
            </button>
          </div>

          {/* Mode Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Choose Split Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSplitMode('selected');
                  setSplitResults([]);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  splitMode === 'selected'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Extract Pages</span>
                  {splitMode === 'selected' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Pick specific pages to extract into one new PDF
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSplitMode('ranges');
                  setSplitResults([]);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  splitMode === 'ranges'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Split by Ranges</span>
                  {splitMode === 'ranges' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Group pages into ranges (e.g. 1-3, 4-7)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSplitMode('all');
                  setSplitResults([]);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  splitMode === 'all'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Split All Pages</span>
                  {splitMode === 'all' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Save every single page as its own 1-page PDF
                </div>
              </button>
            </div>

            {/* Mode-specific configuration */}
            {splitMode === 'selected' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click pages to include in the output PDF ({selectedPages.length} selected):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectAll(true)}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => selectAll(false)}
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-52 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isSelected = selectedPages.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePage(p)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        Page {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {splitMode === 'ranges' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Enter Page Ranges (comma separated, e.g. 1-2, 3-5):
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-2, 3-5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total document length is {totalPages} pages. Each comma-separated range will be generated as a separate PDF file.
                </p>
              </div>
            )}

            {splitMode === 'all' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This will generate <strong className="text-slate-900 dark:text-white">{totalPages} separate PDF files</strong> (one for each page), which you can download individually or all together as a ZIP archive.
                </p>
              </div>
            )}
          </div>

          {/* Action / Result */}
          {splitResults.length === 0 ? (
            <button
              onClick={executeSplit}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{progressText || 'Splitting PDF...'}</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Split PDF Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      PDF Split Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {splitResults.length} output {splitResults.length === 1 ? 'file' : 'files'} ready for download.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {splitResults.length > 1 && (
                    <button
                      onClick={downloadAllZip}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" /> Download All (ZIP)
                    </button>
                  )}
                  <button
                    onClick={() => setSplitResults([])}
                    className="px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100/50 cursor-pointer"
                  >
                    Adjust Settings
                  </button>
                </div>
              </div>

              {/* Output File Cards */}
              <div className="space-y-2">
                {splitResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatFileSize(item.size)} • {item.pages.length} {item.pages.length === 1 ? 'page' : 'pages'} (Pages {item.pages.join(', ')})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadSingle(item)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
