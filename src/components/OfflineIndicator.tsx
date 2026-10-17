import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedNotice, setShowReconnectedNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedNotice(true);
      // Auto-hide reconnected toast after 3 seconds
      const timer = setTimeout(() => setShowReconnectedNotice(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-500/50 animate-in fade-in slide-in-from-bottom-2">
        <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
        <span>Chế độ Ngoại tuyến (Offline) — Dữ liệu ghi nhận sẽ được lưu an toàn trên máy và tự động đồng bộ khi có mạng.</span>
      </div>
    );
  }

  if (showReconnectedNotice) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl border border-emerald-500/50 animate-in fade-in slide-in-from-bottom-2">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Đã kết nối Internet trở lại — Hệ thống đã đồng bộ toàn bộ dữ liệu!</span>
      </div>
    );
  }

  return null;
};
