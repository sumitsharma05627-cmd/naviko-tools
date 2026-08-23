import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, RotateCcw, Sparkles, Sliders, Globe, ShieldCheck } from 'lucide-react';

export const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState<string>('https://naviko.in');
  const [darkColor, setDarkColor] = useState<string>('#1e1b4b'); // Deep indigo
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(text, {
      width: 600,
      margin: margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: errorLevel,
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code', err);
      });
  }, [text, darkColor, lightColor, errorLevel, margin]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `naviko-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    if (!qrDataUrl) return;
    fetch(qrDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback copy text
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Settings */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Content (URL, Plain Text, Phone, Wi-Fi)
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text you want to encode..."
              className="w-full text-sm sm:text-base p-4 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 leading-relaxed shadow-xs"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Quick Types:</span>
            <button
              onClick={() => setText('https://naviko.in')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Website URL
            </button>
            <button
              onClick={() => setText('mailto:hello@naviko.in?subject=Inquiry')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Email Link
            </button>
            <button
              onClick={() => setText('tel:+1234567890')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Phone Number
            </button>
            <button
              onClick={() => setText('WIFI:S:MyHomeWiFi;T:WPA;P:SecretPassword123;;')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Wi-Fi Network
            </button>
          </div>

          {/* Customization Controls */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Styling &amp; Quality Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foreground Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-28 text-xs font-mono font-bold px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-28 text-xs font-mono font-bold px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Error Correction Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Error Correction Level
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                >
                  <option value="L">Low (7% recovery, denser)</option>
                  <option value="M">Medium (15% recovery, standard)</option>
                  <option value="Q">Quartile (25% recovery)</option>
                  <option value="H">High (30% recovery, maximum reliability)</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quiet Zone Margin ({margin} blocks)
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setText('');
                setDarkColor('#1e1b4b');
                setLightColor('#ffffff');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear &amp; Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!qrDataUrl}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Image!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>

        {/* Right QR Live Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600" />
              Scannable QR Preview
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center max-w-[280px] aspect-square w-full">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-slate-400 text-center p-6">
                  Enter text or a URL to generate your QR Code
                </div>
              )}
            </div>

            <div className="w-full mt-6 space-y-3">
              <button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download High-Res PNG
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Static QR code • Never expires • 100% private
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
