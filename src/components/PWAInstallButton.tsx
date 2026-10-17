import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'navbar' | 'banner' | 'footer' }> = ({
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone mode (already installed as PWA)
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 sm:p-4 rounded-2xl border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">Cài đặt EduLMS lên màn hình điện thoại</div>
              <div className="text-[11px] text-blue-200">Mở toàn màn hình, ghi nhận ngoại tuyến và mượt mà như app native</div>
            </div>
          </div>

          <button
            onClick={install}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Cài đặt ngay</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="px-2.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-blue-500/30"
        title="Cài đặt ứng dụng EduLMS lên màn hình chính"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Cài App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit beforeinstallprompt fallback)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          title="Cài đặt trên iPhone/iPad"
        >
          <Apple className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cài trên iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-blue-900">
                <Apple className="w-6 h-6 text-slate-800" />
                <h3 className="font-extrabold text-base text-slate-900">Cài đặt EduLMS trên iPhone</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Để sử dụng EduLMS như ứng dụng chính thức trên iOS Safari:
              </p>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  <span>Nhấn vào nút <strong>Chia sẻ (Share)</strong> ở thanh dưới cùng của Safari.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  <span>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                  <span>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải để hoàn tất.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
